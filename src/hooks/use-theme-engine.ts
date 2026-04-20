"use client";

import { useEffect, useState } from "react";

/**
 * useThemeEngine - Controlador de Tema Modular
 * Arquiteto Frontend Principal - Protocolo Antigravity v4.0
 */
export function useThemeEngine() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    // 1. Verificar Preferência Salva ou Sistema
    const savedTheme = localStorage.getItem("celestial-theme") as "light" | "dark";
    const systemPreference = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    
    const initialTheme = savedTheme || systemPreference;
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (newTheme: "light" | "dark") => {
    const root = window.document.documentElement;
    
    // Engenharia Biofísica: Alternar a classe específica do protocolo
    if (newTheme === "dark") {
      root.classList.add("dark-theme");
      root.classList.remove("light-theme");
    } else {
      root.classList.add("light-theme");
      root.classList.remove("dark-theme");
    }
    
    localStorage.setItem("celestial-theme", newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return { theme, toggleTheme };
}
