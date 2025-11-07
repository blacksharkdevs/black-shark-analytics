import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark";

const LOCAL_STORAGE_KEY = "blackshark_theme";

// Função utilitária para pegar o tema do sistema
const getSystemTheme = (): Theme => {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "dark"; // Default seguro
};

export function useThemeToggle() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    // 🔑 CORREÇÃO NA LEITURA: Primeiro tenta o valor do localStorage
    const storedTheme = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme as Theme;
    }

    // Se nada estiver armazenado, usa a preferência do sistema
    return getSystemTheme();
  });

  const isDark = theme === "dark";

  // Efeito que sincroniza o estado com o DOM e localStorage
  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem(LOCAL_STORAGE_KEY, theme);
  }, [theme]);

  // Função para alternar o tema
  const toggleTheme = () => {
    setThemeState((currentTheme) =>
      currentTheme === "dark" ? "light" : "dark"
    );
  };

  // Função para definir um tema específico
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  return { theme, isDark, setTheme, toggleTheme };
}
