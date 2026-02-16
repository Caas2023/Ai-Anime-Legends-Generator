"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Swords, Sparkles, Zap, Moon, Skull, Crown, Flame, Star, Ghost, Heart } from "lucide-react";

interface CharacterSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const CHARACTERS = [
  { id: "goku", label: "Goku", anime: "Dragon Ball", icon: Flame, color: "orange" },
  { id: "naruto", label: "Naruto", anime: "Naruto", icon: Star, color: "yellow" },
  { id: "luffy", label: "Luffy", anime: "One Piece", icon: Skull, color: "red" },
  { id: "sailormoon", label: "Sailor Moon", anime: "Sailor Moon", icon: Moon, color: "pink" },
  { id: "ichigo", label: "Ichigo", anime: "Bleach", icon: Swords, color: "slate" },
  { id: "zoro", label: "Zoro", anime: "One Piece", icon: Swords, color: "green" },
  { id: "nezuko", label: "Nezuko", anime: "Demon Slayer", icon: Heart, color: "rose" },
  { id: "gojo", label: "Gojo", anime: "Jujutsu Kaisen", icon: Zap, color: "cyan" },
  { id: "makima", label: "Makima", anime: "Chainsaw Man", icon: Ghost, color: "red" },
  { id: "vegeta", label: "Vegeta", anime: "Dragon Ball", icon: Crown, color: "blue" },
];

const colorClasses: Record<string, { active: string; hover: string; icon: string }> = {
  orange: { active: "border-orange-500 bg-orange-500/20 text-orange-100", hover: "hover:border-orange-500/50", icon: "text-orange-400" },
  yellow: { active: "border-yellow-500 bg-yellow-500/20 text-yellow-100", hover: "hover:border-yellow-500/50", icon: "text-yellow-400" },
  red: { active: "border-red-500 bg-red-500/20 text-red-100", hover: "hover:border-red-500/50", icon: "text-red-400" },
  pink: { active: "border-pink-500 bg-pink-500/20 text-pink-100", hover: "hover:border-pink-500/50", icon: "text-pink-400" },
  slate: { active: "border-slate-500 bg-slate-500/20 text-slate-100", hover: "hover:border-slate-500/50", icon: "text-slate-400" },
  green: { active: "border-green-500 bg-green-500/20 text-green-100", hover: "hover:border-green-500/50", icon: "text-green-400" },
  rose: { active: "border-rose-500 bg-rose-500/20 text-rose-100", hover: "hover:border-rose-500/50", icon: "text-rose-400" },
  cyan: { active: "border-cyan-500 bg-cyan-500/20 text-cyan-100", hover: "hover:border-cyan-500/50", icon: "text-cyan-400" },
  blue: { active: "border-blue-500 bg-blue-500/20 text-blue-100", hover: "hover:border-blue-500/50", icon: "text-blue-400" },
};

export function CharacterSelector({ value, onChange, disabled }: CharacterSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {CHARACTERS.map((char) => {
        const Icon = char.icon;
        const colors = colorClasses[char.color];
        const isSelected = value === char.id;

        return (
          <button
            key={char.id}
            onClick={() => onChange(char.id)}
            disabled={disabled}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-300 gap-1.5 relative overflow-hidden group",
              isSelected
                ? `${colors.active} shadow-[0_0_15px_rgba(0,0,0,0.5)] scale-105`
                : `border-white/5 bg-card/30 hover:bg-card/60 text-muted-foreground ${colors.hover}`,
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className={cn("p-2 rounded-full bg-black/40 backdrop-blur-sm", isSelected ? colors.icon : "text-muted-foreground group-hover:text-white")}>
              <Icon className="w-8 h-8 md:w-6 md:h-6" />
            </div>
            <div className="text-center">
              <span className="text-sm font-bold block">{char.label}</span>
              <span className="text-[10px] opacity-70 uppercase tracking-wider">{char.anime}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
