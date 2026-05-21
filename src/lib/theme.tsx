import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type AppTheme = "jamdani" | "midnight" | "lotus" | "meghna";

const themeLabels: Record<AppTheme, { bn: string; en: string; emoji: string }> = {
  jamdani: { bn: "জামদানি", en: "Jamdani", emoji: "🧵" },
  midnight: { bn: "নিশি", en: "Midnight", emoji: "🌙" },
  lotus: { bn: "শাপলা", en: "Lotus", emoji: "🌸" },
  meghna: { bn: "মেঘনা", en: "Meghna", emoji: "🌊" },
};

interface ThemeCtx {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  themeLabels: typeof themeLabels;
}

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>("jamdani");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("adda-theme") as AppTheme | null;
    if (saved && saved in themeLabels) setThemeState(saved);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("adda-theme", theme);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme: setThemeState, themeLabels }), [theme]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTheme must be inside ThemeProvider");
  return c;
}