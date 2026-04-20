"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { User, UserRound, Baby, Crown, Swords, Sparkles, Cat, Skull } from "lucide-react";

interface CharacterSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const CHARACTER_TYPES = [
  { id: "male", label: "Homem", icon: User, color: "blue" },
  { id: "female", label: "Mulher", icon: UserRound, color: "pink" },
  { id: "boy", label: "Garoto", icon: Baby, color: "cyan" },
  { id: "girl", label: "Garota", icon: Sparkles, color: "purple" },
  { id: "warrior", label: "Guerreiro", icon: Swords, color: "orange" },
  { id: "princess", label: "Princesa", icon: Crown, color: "yellow" },
  { id: "catgirl", label: "Neko", icon: Cat, color: "rose" },
  { id: "villain", label: "Vilão", icon: Skull, color: "red" },
];

const colorThemes: Record<string, string> = {
  blue: "from-blue-500/20 to-blue-500/5 text-blue-200 border-blue-500/20",
  pink: "from-pink-500/20 to-pink-500/5 text-pink-200 border-pink-500/20",
  cyan: "from-cyan-500/20 to-cyan-500/5 text-cyan-200 border-cyan-500/20",
  purple: "from-purple-500/20 to-purple-500/5 text-purple-200 border-purple-500/20",
  orange: "from-orange-500/20 to-orange-500/5 text-orange-200 border-orange-500/20",
  yellow: "from-yellow-500/20 to-yellow-500/5 text-yellow-200 border-yellow-500/20",
  rose: "from-rose-500/20 to-rose-500/5 text-rose-200 border-rose-500/20",
  red: "from-red-500/20 to-red-500/5 text-red-200 border-red-500/20",
};

export function GenderSelector({ value, onChange, disabled }: CharacterSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {CHARACTER_TYPES.map((char) => {
        const Icon = char.icon;
        const theme = colorThemes[char.color];
        const isSelected = value === char.id;

        return (
          <button
            key={char.id}
            onClick={() => onChange(char.id)}
            disabled={disabled}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-500 gap-1.5 relative overflow-hidden",
              isSelected
                ? `bg-gradient-to-br ${theme} border-white/20 shadow-xl scale-105`
                : "bg-white/[0.02] border-white/5 text-white/20 hover:bg-white/5 hover:border-white/10 hover:text-white/40",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <Icon className={cn("w-4 h-4 transition-transform duration-500", isSelected ? "scale-110" : "group-hover:scale-110")} />
            <span className="text-[8px] font-black uppercase tracking-tighter">{char.label}</span>
            
            {isSelected && (
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary/50" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export { CHARACTER_TYPES };

