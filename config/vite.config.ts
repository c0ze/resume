import { defineConfig, type PluginOption, type UserConfig } from "vite";
import { execSync } from "node:child_process";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const clientRoot = path.resolve(projectRoot, "client");
const clientSrcRoot = path.resolve(clientRoot, "src");
const distRoot = path.resolve(projectRoot, "dist");
const postcssConfigPath = path.resolve(import.meta.dirname, "postcss.config.cjs");

/**
 * Machine provenance for the countersign block.
 *
 * The record has no second party — inventing a human witness is forbidden — so
 * the witness is the build itself: the commit the page was rendered from and
 * the moment it was issued. `scripts/build-static.mjs` pins RESUME_BUILD_TIME
 * once so the client bundle and the SSR bundle, built seconds apart, agree.
 */
function buildCommit(): string {
  const fromCi = process.env.GITHUB_SHA;
  if (fromCi) return fromCi.slice(0, 10);
  try {
    return execSync("git rev-parse --short=10 HEAD", {
      cwd: projectRoot,
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return "unversioned";
  }
}

export default defineConfig(async ({ mode }): Promise<UserConfig> => {
  const isProduction = mode === "production";
  const isSsrBuild = process.env.SSR_BUILD === "true";

  const basePlugins: PluginOption[] = [];

  const commonConfig: Partial<UserConfig> = {
    base: "/",
    root: clientRoot,
    /**
     * The assets live in <projectRoot>/public, but Vite's root is client/, so
     * its default publicDir would be client/public — which does not exist.
     * Without this the dev server answers /images/logos/*.png with the SPA
     * index.html at 200 text/html, and every employer mark silently fails to
     * decode. The production build was unaffected (build-static.mjs copies
     * public/ into dist/client itself), so dev and prod disagreed.
     */
    publicDir: path.resolve(projectRoot, "public"),
    define: {
      __BUILD_COMMIT__: JSON.stringify(buildCommit()),
      __BUILD_TIME__: JSON.stringify(
        process.env.RESUME_BUILD_TIME ?? new Date().toISOString()
      ),
    },
    css: {
      postcss: postcssConfigPath,
    },
    resolve: {
      alias: {
        "@": clientSrcRoot,
      },
    },
  };

  if (isSsrBuild) {
    return {
      ...commonConfig,
      plugins: basePlugins,
      publicDir: false,
      build: {
        outDir: path.resolve(distRoot, "server"),
        ssr: true,
        rollupOptions: {
          input: path.resolve(clientSrcRoot, "EntryServer.res.mjs"),
          external: ["react", "react-dom", "react-dom/server"],
          output: {
            format: "esm",
            entryFileNames: "entry-server.js",
          },
        },
        emptyOutDir: true,
        manifest: false,
        ssrManifest: true,
      },
    } as UserConfig;
  }

  return {
    ...commonConfig,
    plugins: basePlugins,
    build: {
      outDir: path.resolve(distRoot, "client"),
      emptyOutDir: true,
      manifest: true,
      ssrManifest: false,
    },
  } as UserConfig;
});
