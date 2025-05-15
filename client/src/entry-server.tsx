import ReactDOMServer from 'react-dom/server';
import { Router as WouterRouter } from 'wouter'; // Renamed to avoid conflict if any, and for clarity
import staticLocationHook from 'wouter/static-location';
import App from './App';
// LanguageProvider and QueryClientProvider are already inside App, so no need to wrap App again here.
// App itself now contains the WouterRouter with the base path.

const basePath = "/resume"; // Define base path, consistent with Vite config and App.tsx

export function render(url: string) {
  // The staticLocationHook needs to be aware of the base path.
  // It expects the full path including the base.
  // If the incoming `url` from the server already includes `/resume` (e.g., `/resume/somepage`),
  // then `staticLocationHook(url, { base: basePath })` will correctly handle it.
  // If `url` is just `/somepage` (relative to base), then `staticLocationHook(basePath + url)` might be needed,
  // but typically the server provides the full path.
  // For now, let's assume `url` is the full path (e.g., /resume/ or /resume/somepage).
  // The Router component's `base` prop will handle stripping it for matching.
  const currentPathHook = staticLocationHook(url); // Corrected: staticLocationHook does not take a base option.


  const html = ReactDOMServer.renderToString(
    // The <App /> component now includes its own WouterRouter configured with the basePath.
    // We still need a Router here for the staticLocationHook to work for SSR.
    // This outer Router provides the location context based on the server request and handles the base path.
    <WouterRouter hook={currentPathHook} base={basePath}>
      {/* App already has QueryClientProvider and LanguageProvider */}
      <App />
    </WouterRouter>
  );
  return { html };
}