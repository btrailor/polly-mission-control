"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "linear" | "reas" | "fidenza" | "ghost-box" | "martens" | "jetset" | "riley" | "albers";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("linear");
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("polly-theme") as Theme | null;
    if (saved) setThemeState(saved);
    const savedSidebar = localStorage.getItem("polly-sidebar-collapsed");
    if (savedSidebar) setSidebarCollapsedState(savedSidebar === "true");
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("polly-theme", t);
  };

  const setSidebarCollapsed = (c: boolean) => {
    setSidebarCollapsedState(c);
    localStorage.setItem("polly-sidebar-collapsed", String(c));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, sidebarCollapsed, setSidebarCollapsed }}>
      <div data-theme={theme} className="h-full">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
