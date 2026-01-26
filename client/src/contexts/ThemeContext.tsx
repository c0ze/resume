import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "van-helsing" | "dracula" | "alucard";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "resume-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (stored && ["van-helsing", "dracula", "alucard"].includes(stored)) {
        return stored;
      }
    }
    return "van-helsing";
  });

  useEffect(() => {
    const root = document.documentElement;

    // Remove all theme classes
    root.classList.remove("van-helsing", "dracula", "alucard");

    // Add current theme class
    root.classList.add(theme);

    // Store preference
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
