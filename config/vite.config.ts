import { defineConfig, type PluginOption, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const clientRoot = path.resolve(projectRoot, "client");
const clientSrcRoot = path.resolve(clientRoot, "src");
const distRoot = path.resolve(projectRoot, "dist");
const postcssConfigPath = path.resolve(import.meta.dirname, "postcss.config.cjs");

async function getCartographerPlugin(_isProduction: boolean): Promise<PluginOption[]> {
  return [];
}

export default defineConfig(async ({ mode }): Promise<UserConfig> => {
  const isProduction = mode === "production";
  const isSsrBuild = process.env.SSR_BUILD === "true";

  const cartographerPlugins = await getCartographerPlugin(isProduction);

  const basePlugins: PluginOption[] = [
    react(),
    ...cartographerPlugins,
  ];

  const clientOnlyPlugins: PluginOption[] = [];

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
          input: path.resolve(clientSrcRoot, "entry-server.tsx"),
          external: [
            "react",
            "react-dom",
            "react-dom/server",
            "@tanstack/react-query",
            /^@radix-ui\/.*/,
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
    plugins: [...basePlugins, ...clientOnlyPlugins],
    build: {
      outDir: path.resolve(distRoot, "client"),
      emptyOutDir: true,
      manifest: true,
      ssrManifest: false,
    },
  } as UserConfig;
});
