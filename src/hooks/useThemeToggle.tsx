import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark";

const LOCAL_STORAGE_KEY = "blackshark_theme";

export function useThemeToggle() {
  // Inicializa o estado lendo do localStorage, com 'dark' como fallback
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(LOCAL_STORAGE_KEY) as Theme) || "dark";
    }
    return "dark";
  });

  // Efeito que sincroniza o estado com o DOM e localStorage
  useEffect(() => {
    const root = window.document.documentElement; // A tag <html>

    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem(LOCAL_STORAGE_KEY, theme);
  }, [theme]);

  // Função para alternar o tema
  const toggleTheme = useCallback(() => {
    setThemeState((currentTheme) =>
      currentTheme === "dark" ? "light" : "dark"
    );
  }, []);

  // Função para definir um tema específico
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  return { theme, setTheme, toggleTheme };
}
