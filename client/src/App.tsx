import { Switch, Route, Router as WouterRouter } from "wouter"; // Import WouterRouter
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { LanguageProvider } from "./contexts/LanguageContext";

const basePath = "/resume"; // Define base path, consistent with Vite config (without trailing slash for wouter)

// Renamed to avoid confusion with WouterRouter and to encapsulate the Switch
function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Home} /> {/* Matches basePath + "/" => /resume/ */}
      <Route component={NotFound} /> {/* This will handle routes not matched under /resume, e.g., /resume/nonexistent */}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        {/* Wrap AppRoutes with WouterRouter and provide the base path */}
        <WouterRouter base={basePath}>
          <AppRoutes />
        </WouterRouter>
        <Toaster />
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
