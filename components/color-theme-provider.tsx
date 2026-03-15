"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type ColorTheme = "default" | "ocean" | "forest" | "rose";

export const COLOR_THEMES: { id: ColorTheme; label: string; color: string }[] =
  [
    { id: "default", label: "Default", color: "#18181b" },
    { id: "ocean", label: "Ocean", color: "#3b82f6" },
    { id: "forest", label: "Forest", color: "#16a34a" },
    { id: "rose", label: "Rose", color: "#e11d48" },
  ];

const LS_KEY = "tp-ai-color-theme";

type ColorThemeContextValue = {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
};

const ColorThemeContext = createContext<ColorThemeContextValue>({
  colorTheme: "default",
  setColorTheme: () => {},
});

export function ColorThemeProvider({ children }: { children: ReactNode }) {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>("default");

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY) as ColorTheme | null;
    if (stored && COLOR_THEMES.some((t) => t.id === stored)) {
      setColorThemeState(stored);
      applyTheme(stored);
    }
  }, []);

  function setColorTheme(theme: ColorTheme) {
    setColorThemeState(theme);
    localStorage.setItem(LS_KEY, theme);
    applyTheme(theme);
  }

  return (
    <ColorThemeContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ColorThemeContext.Provider>
  );
}

function applyTheme(theme: ColorTheme) {
  const html = document.documentElement;
  if (theme === "default") {
    html.removeAttribute("data-color-theme");
  } else {
    html.setAttribute("data-color-theme", theme);
  }
}

export function useColorTheme() {
  return useContext(ColorThemeContext);
}
