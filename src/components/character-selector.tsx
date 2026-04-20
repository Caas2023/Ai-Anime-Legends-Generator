"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { SafeImage } from "./safe-image";
import { CHARACTERS } from "@/lib/constants";
import { Check } from "lucide-react";

interface CharacterSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const colorThemes: Record<string, string> = {
  orange: "from-orange-500/20 to-orange-500/5 dark:text-orange-200 text-orange-900 border-orange-500/20 shadow-orange-500/10",
  yellow: "from-yellow-500/20 to-yellow-500/5 dark:text-yellow-200 text-yellow-900 border-yellow-500/20 shadow-yellow-500/10",
  red: "from-red-500/20 to-red-500/5 dark:text-red-200 text-red-900 border-red-500/20 shadow-red-500/10",
  pink: "from-pink-500/20 to-pink-500/5 dark:text-pink-200 text-pink-900 border-pink-500/20 shadow-pink-500/10",
  slate: "from-slate-500/20 to-slate-500/5 dark:text-slate-200 text-slate-900 border-slate-500/20 shadow-slate-500/10",
  green: "from-green-500/20 to-green-500/5 dark:text-green-200 text-green-900 border-green-500/20 shadow-green-500/10",
  rose: "from-rose-500/20 to-rose-500/5 dark:text-rose-200 text-rose-900 border-rose-500/20 shadow-rose-500/10",
  cyan: "from-cyan-500/20 to-cyan-500/5 dark:text-cyan-200 text-cyan-900 border-cyan-500/20 shadow-cyan-500/10",
  blue: "from-blue-500/20 to-blue-500/5 dark:text-blue-200 text-blue-900 border-blue-500/20 shadow-blue-500/10",
  purple: "from-purple-500/20 to-purple-500/5 dark:text-purple-200 text-purple-900 border-purple-500/20 shadow-purple-500/10",
  indigo: "from-indigo-500/20 to-indigo-500/5 dark:text-indigo-200 text-indigo-900 border-indigo-500/20 shadow-indigo-500/10",
};


export function CharacterSelector({ value, onChange, disabled }: CharacterSelectorProps) {
  return (
    <div className="w-full">
      <div className="flex xl:flex-col overflow-x-auto xl:overflow-y-auto xl:max-h-[50vh] gap-2 pb-2 xl:pb-0 xl:pr-2 custom-scrollbar snap-x xl:snap-y scroll-smooth">
        {CHARACTERS.map((char) => {
          const isSelected = value === char.id;
          const theme = colorThemes[char.color] || colorThemes.slate;
          const photoUrl = `/avatars/${char.id}.jpg`;

          return (
            <button
              key={char.id}
              onClick={() => onChange(char.id)}
              disabled={disabled}
              aria-label={`Selecionar herói ${char.label}`}
              className={cn(
                "flex-none w-16 xl:w-full p-1.5 celestial-card border transition-all duration-500 group relative overflow-hidden snap-center",
                isSelected
                  ? `bg-gradient-to-br ${theme} border-accent/30 shadow-2xl scale-105 xl:translate-x-1`
                  : "bg-surface hover:bg-muted hover:border-accent/10",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex flex-col xl:flex-row items-center gap-2">
                <div className={cn(
                    "w-10 h-10 xl:w-9 xl:h-9 rounded-full overflow-hidden border transition-transform duration-700 group-hover:rotate-6 group-hover:scale-110 flex-shrink-0",
                    isSelected ? "border-accent shadow-[0_0_15px_var(--accent-glow)]" : "border-border"
                )}>


                  <SafeImage 
                    src={photoUrl} 
                    alt="" 
                    fallbackName={char.label}
                    className="w-full h-full object-cover" 
                  />
                </div>
                
                <div className="text-center xl:text-left flex-1 overflow-hidden">
                    <p className={cn(
                        "text-[9px] xl:text-[11px] font-black uppercase tracking-tight truncate leading-tight transition-colors",
                         isSelected ? "text-foreground" : "text-white/90"
                    )}>
                        {char.label}
                    </p>
                    <p className="hidden xl:block text-[8px] font-bold text-white/50 uppercase tracking-widest mt-0.5 truncate">
                        {char.anime}
                    </p>




                </div>

                {isSelected && (
                  <div className="absolute top-1 right-1 bg-accent rounded-full p-0.5 shadow-lg border border-white/20">
                    <Check className="w-2.5 h-2.5 text-background stroke-[4px]" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

