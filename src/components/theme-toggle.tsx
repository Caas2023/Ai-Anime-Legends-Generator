"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useThemeEngine } from "@/hooks/use-theme-engine"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  // Arquiteto Principal: Consumindo o motor de temas purista
  const { theme, toggleTheme } = useThemeEngine()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="w-10 h-10 rounded-full bg-foreground/5 hover:bg-foreground/10 border-border text-foreground/70 hover:text-foreground transition-all"
      onClick={toggleTheme}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark-theme:rotate-[-90deg] dark-theme:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark-theme:rotate-0 dark-theme:scale-100" />
      
      {/* Bio-Visual: Ocultar texto para foco iconográfico */}
      <span className="sr-only">Alternar tema</span>
    </Button>
  )
}
