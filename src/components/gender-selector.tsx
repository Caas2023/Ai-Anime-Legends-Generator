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

const colorClasses: Record<string, { active: string; hover: string }> = {
  blue: {
    active: "border-blue-500 bg-blue-500/20 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.5)]",
    hover: "hover:border-blue-500/50",
  },
  pink: {
    active: "border-pink-500 bg-pink-500/20 text-pink-100 shadow-[0_0_15px_rgba(236,72,153,0.5)]",
    hover: "hover:border-pink-500/50",
  },
  cyan: {
    active: "border-cyan-500 bg-cyan-500/20 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.5)]",
    hover: "hover:border-cyan-500/50",
  },
  purple: {
    active: "border-purple-500 bg-purple-500/20 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.5)]",
    hover: "hover:border-purple-500/50",
  },
  orange: {
    active: "border-orange-500 bg-orange-500/20 text-orange-100 shadow-[0_0_15px_rgba(249,115,22,0.5)]",
    hover: "hover:border-orange-500/50",
  },
  yellow: {
    active: "border-yellow-500 bg-yellow-500/20 text-yellow-100 shadow-[0_0_15px_rgba(234,179,8,0.5)]",
    hover: "hover:border-yellow-500/50",
  },
  rose: {
    active: "border-rose-400 bg-rose-500/20 text-rose-100 shadow-[0_0_15px_rgba(251,113,133,0.5)]",
    hover: "hover:border-rose-400/50",
  },
  red: {
    active: "border-red-500 bg-red-500/20 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.5)]",
    hover: "hover:border-red-500/50",
  },
};

export function GenderSelector({ value, onChange, disabled }: CharacterSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {CHARACTER_TYPES.map((char) => {
        const Icon = char.icon;
        const colors = colorClasses[char.color];
        const isSelected = value === char.id;

        return (
          <button
            key={char.id}
            onClick={() => onChange(char.id)}
            disabled={disabled}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-300 gap-1.5",
              isSelected
                ? colors.active
                : `border-white/10 bg-card/50 hover:bg-card/80 text-muted-foreground ${colors.hover}`
            )}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs font-semibold">{char.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Export character types for use in generate function
export { CHARACTER_TYPES };
