import { defineConfig, type UserConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Async function to get cartographer plugin if needed
async function getCartographerPlugin(isProduction: boolean): Promise<PluginOption[]> {
  if (!isProduction && process.env.REPL_ID !== undefined) {
    try {
      const m = await import("@replit/vite-plugin-cartographer");
      return [m.cartographer()];
    } catch (e) {
      console.warn("Failed to load @replit/vite-plugin-cartographer:", e);
      return [];
    }
  }
  return [];
}

export default defineConfig(async ({ command, mode }): Promise<UserConfig> => {
  const isProduction = mode === "production";
  // Vite sets process.env.SSR_BUILD to 'true' when --ssr flag is used for the build command
  const isSsrBuild = process.env.SSR_BUILD === 'true';

  const cartographerPlugins = await getCartographerPlugin(isProduction);

  const basePlugins: PluginOption[] = [
    react(),
    themePlugin(), // Assuming this is needed for both client and SSR or benign for SSR
    ...cartographerPlugins,
  ];

  // runtimeErrorOverlay is for client-side development only
  const clientOnlyPlugins: PluginOption[] = !isProduction ? [runtimeErrorOverlay()] : [];

  const commonConfig: Partial<UserConfig> = {
    resolve: {
      alias: {
        // Ensure paths are resolved from the project root (where vite.config.ts is)
        "@": path.resolve(import.meta.dirname, "client/src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"), // Assuming this is at project root
      },
    },
    // Vite's 'root' is where index.html and src/main.tsx are located for the client app
    root: path.resolve(import.meta.dirname, "client"),
  };

  if (isSsrBuild) {
    // SSR build configuration
    return {
      ...commonConfig,
      plugins: basePlugins, // Server plugins might differ, e.g., no client-specific overlays
      publicDir: false, // Don't copy public dir for server bundle
      build: {
        // Output to project_root/dist/server
        outDir: path.resolve(import.meta.dirname, "dist/server"),
        ssr: true, // Mark as SSR build type
        rollupOptions: {
          // Explicitly set the input for SSR build using an absolute path
          input: path.resolve(import.meta.dirname, "client/src/entry-server.tsx"),
          // Externalize deps that shouldn't be bundled into the SSR build.
          external: [
            'react', 'react-dom', 'react-dom/server',
            // 'wouter', 'wouter/static-location', // No longer externalizing wouter
            '@tanstack/react-query',
            /^@radix-ui\/.*/, // Externalize all @radix-ui packages
            'lucide-react',
            // Add any other large dependencies or Node.js built-ins if necessary
          ],
          output: {
            format: "esm",
            entryFileNames: 'entry-server.js', // Output file name for the SSR bundle
          },
        },
        emptyOutDir: true, // Clean the dist/server directory before build
        manifest: false, // No client manifest for SSR build
        ssrManifest: true, // Generate ssr-manifest.json for preloading links
      },
    } as UserConfig;
  } else {
    // Client build configuration
    return {
      ...commonConfig,
      plugins: [...basePlugins, ...clientOnlyPlugins],
      build: {
        // Output to project_root/dist/client
        outDir: path.resolve(import.meta.dirname, "dist/client"),
        emptyOutDir: true, // Clean the dist/client directory before build
        manifest: true, // Generate manifest.json for preloading links
        ssrManifest: false, // No SSR manifest for client build
      },
    } as UserConfig;
  }
});
