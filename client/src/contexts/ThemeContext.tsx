import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "van-helsing" | "dracula" | "alucard";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "resume-theme";
const THEMES: Theme[] = ["van-helsing", "dracula", "alucard"];
const DARK_THEMES = new Set<Theme>(["van-helsing", "dracula"]);
const DEFAULT_THEME: Theme = "alucard";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (stored && THEMES.includes(stored)) {
        return stored;
      }
    }
    return DEFAULT_THEME;
  });

  useEffect(() => {
    const root = document.documentElement;
    const isDarkTheme = DARK_THEMES.has(theme);

    root.classList.remove(...THEMES, "dark");

    root.classList.add(theme);
    if (isDarkTheme) {
      root.classList.add("dark");
    }
    root.style.colorScheme = isDarkTheme ? "dark" : "light";

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
