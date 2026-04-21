"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Palette, Box, Film, Camera, Zap, FileImage, Droplets, Ghost, Check } from "lucide-react";
import { ART_STYLES } from "@/lib/constants";
import { LucideIcon } from "lucide-react";

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const STYLE_ICONS: Record<string, LucideIcon> = {
  flux: Zap,
  realistic: Camera,
  "3d": Box,
  retro: Film,
  manga: FileImage,
  cyberpunk: Ghost,
  watercolor: Droplets,
  dark: Palette,
};

export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-3 lg:grid-cols-4 gap-1.5 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
        {ART_STYLES.map((style) => {
          const isSelected = value === style.id;
          const Icon = STYLE_ICONS[style.id] || Palette;

          return (
            <button
              key={style.id}
              onClick={() => onChange(style.id)}
              disabled={disabled}
              aria-label={`Selecionar estilo ${style.label}`}
              className={cn(
                "flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all duration-300 relative group",
                isSelected
                  ? "bg-primary text-primary-foreground border-transparent shadow-lg scale-[0.98]"
                  : "bg-surface border-border text-secondary hover:bg-muted hover:text-primary",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className={cn(
                "mb-1.5 p-1 rounded-lg transition-colors duration-500",
                isSelected ? "bg-white/20 text-white" : "bg-primary/5 group-hover:bg-primary/20"
              )}>
                <Icon className="w-4 h-4" />
              </div>
              
              <span className="text-[7.5px] font-black uppercase tracking-[0.15em] text-center truncate w-full px-1">
                {style.label.split(' ')[0]}
              </span>

              {isSelected && (
                <div className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow-md">
                  <Check className="w-1.5 h-1.5 text-primary stroke-[4px]" />
                </div>
              )}
            </button>


          );
        })}
      </div>
    </div>
  );
}
