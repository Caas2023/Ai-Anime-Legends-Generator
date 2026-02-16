"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Palette, Box, Film, Camera, Zap, FileImage, Droplets, Ghost } from "lucide-react";

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const ART_STYLES = [
  { id: "flux", label: "Flux Original", description: "Melhor Qualidade", icon: Zap, color: "yellow" },
  { id: "realistic", label: "Realista", description: "Live Action Style", icon: Camera, color: "blue" },
  { id: "3d", label: "3D Render", description: "Pixar / Game Style", icon: Box, color: "pink" },
  { id: "retro", label: "Retro 90s", description: "Nostalgia VHS", icon: Film, color: "pink" },
  { id: "manga", label: "Mangá", description: "Preto e Branco", icon: FileImage, color: "slate" },
  { id: "cyberpunk", label: "Cyberpunk", description: "Neon & Futuro", icon: Ghost, color: "cyan" },
  { id: "watercolor", label: "Aquarela", description: "Suave e Artístico", icon: Droplets, color: "rose" },
  { id: "dark", label: "Sombrio", description: "Dark Fantasy", icon: Palette, color: "red" },
];

export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {ART_STYLES.map((style) => {
        const Icon = style.icon;
        const isSelected = value === style.id;

        return (
          <button
            key={style.id}
            onClick={() => onChange(style.id)}
            disabled={disabled}
            className={cn(
              "flex items-center text-left p-3 rounded-xl border-2 transition-all duration-300 gap-3",
              isSelected
                ? "border-primary bg-primary/20 text-primary-foreground shadow-lg shadow-primary/10"
                : "border-white/5 bg-card/30 hover:bg-card/60 text-muted-foreground hover:border-white/20",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className={cn(
              "p-2 rounded-lg",
              isSelected ? "bg-primary text-black" : "bg-black/20"
            )}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold block">{style.label}</span>
              <span className="text-[10px] opacity-70">{style.description}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
