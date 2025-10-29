import ReactDOMServer from 'react-dom/server';
import { Router as WouterRouter } from 'wouter';
// Removed: import staticLocationHook from 'wouter/static-location';
import App from './App';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { LanguageProvider } from './contexts/LanguageContext';

// ROUTER_BASE_PATH is for Wouter's `base` prop. Typically no trailing slash.
const ROUTER_BASE_PATH = "/resume";

// VITE_CONFIG_BASE_URL should match the `base` in vite.config.ts.
// This is used to construct the full ssrPath.
const VITE_CONFIG_BASE_URL = "/resume/";

export function render(url: string) { // url from static generator, e.g., "/", "/about"
  let ssrPathForWouter: string; // Renamed variable

  if (url === "/") {
    ssrPathForWouter = VITE_CONFIG_BASE_URL;
  } else {
    const base = VITE_CONFIG_BASE_URL.endsWith('/') ? VITE_CONFIG_BASE_URL : VITE_CONFIG_BASE_URL + '/';
    const segment = url.startsWith('/') ? url.substring(1) : url;
    ssrPathForWouter = base + segment;
  }
  ssrPathForWouter = ssrPathForWouter.replace(/\/\/+/g, '/');

  // Removed: const hook = staticLocationHook(pathForStaticHook);

  const html = ReactDOMServer.renderToString(
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        {/* Use ssrPath prop with the Router's base prop */}
        <WouterRouter ssrPath={ssrPathForWouter} base={ROUTER_BASE_PATH}>
          {/* App is now a direct child of WouterRouter */}
          <App />
        </WouterRouter>
      </LanguageProvider>
    </QueryClientProvider>
  );
  return { html };
}