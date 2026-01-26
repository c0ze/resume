import { useTheme } from "../contexts/ThemeContext";
import { Moon, Sun, Sparkles } from "lucide-react";

const themes = [
  { id: "van-helsing", name: "Dark", icon: Moon },
  { id: "dracula", name: "Dracula", icon: Sparkles },
  { id: "alucard", name: "Light", icon: Sun },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const currentIndex = themes.findIndex((t) => t.id === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].id);
  };

  const currentTheme = themes.find((t) => t.id === theme) || themes[0];
  const Icon = currentTheme.icon;

  return (
    <button
      onClick={cycleTheme}
      className="flex items-center justify-center w-9 h-9 rounded-full bg-secondary border border-border text-muted-foreground hover:bg-primary/20 hover:text-primary hover:border-primary/50 transition-all"
      aria-label={`Current theme: ${currentTheme.name}. Click to change.`}
      title={currentTheme.name}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
