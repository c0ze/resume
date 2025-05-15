import ReactDOMServer from 'react-dom/server';
import { Router } from 'wouter';
import staticLocationHook from 'wouter/static-location'; // This is the hook
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

export function render(url: string) {
  // Create a static location hook for the current URL
  const currentPathHook = staticLocationHook(url);

  const html = ReactDOMServer.renderToString(
    <Router hook={currentPathHook}>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </QueryClientProvider>
    </Router>
  );
  return { html };
}