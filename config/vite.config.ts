import { defineConfig, type PluginOption, type UserConfig } from "vite";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const clientRoot = path.resolve(projectRoot, "client");
const clientSrcRoot = path.resolve(clientRoot, "src");
const distRoot = path.resolve(projectRoot, "dist");
const postcssConfigPath = path.resolve(import.meta.dirname, "postcss.config.cjs");

export default defineConfig(async ({ mode }): Promise<UserConfig> => {
  const isProduction = mode === "production";
  const isSsrBuild = process.env.SSR_BUILD === "true";

  const basePlugins: PluginOption[] = [];

  const commonConfig: Partial<UserConfig> = {
    base: "/",
    root: clientRoot,
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
          external: [
            "react",
            "react-dom",
            "react-dom/server",
            "lucide-react",
          ],
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
