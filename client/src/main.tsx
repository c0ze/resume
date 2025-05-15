import { createRoot } from "react-dom/client";
import { Router as WouterRouter } from "wouter";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { LanguageProvider } from "./contexts/LanguageContext";

const ROUTER_BASE_PATH = "/resume"; // Consistent with entry-server.tsx

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <WouterRouter base={ROUTER_BASE_PATH}>
        <App />
      </WouterRouter>
    </LanguageProvider>
  </QueryClientProvider>
);
