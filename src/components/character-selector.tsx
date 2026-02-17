"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Swords, Sparkles, Zap, Moon, Skull, Crown, Flame, Star, Ghost, Heart, Shield, Eye, Target, Cloud, Sun, Droplets, Wind, Hexagon, Circle } from "lucide-react";

interface CharacterSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const CHARACTERS = [
  // Dragon Ball
  { id: "goku", label: "Goku", anime: "Dragon Ball", icon: Flame, color: "orange" },
  { id: "vegeta", label: "Vegeta", anime: "Dragon Ball", icon: Crown, color: "blue" },
  { id: "gohan", label: "Gohan", anime: "Dragon Ball", icon: Zap, color: "purple" },
  { id: "broly", label: "Broly", anime: "Dragon Ball", icon: Shield, color: "green" },
  { id: "frieza", label: "Frieza", anime: "Dragon Ball", icon: Hexagon, color: "purple" },

  // Naruto
  { id: "naruto", label: "Naruto", anime: "Naruto", icon: Star, color: "yellow" },
  { id: "sasuke", label: "Sasuke", anime: "Naruto", icon: Eye, color: "indigo" },
  { id: "kakashi", label: "Kakashi", anime: "Naruto", icon: Target, color: "slate" },
  { id: "itachi", label: "Itachi", anime: "Naruto", icon: Cloud, color: "red" },
  { id: "sakura", label: "Sakura", anime: "Naruto", icon: Heart, color: "pink" },
  { id: "hinata", label: "Hinata", anime: "Naruto", icon: Eye, color: "indigo" },
  { id: "jiraiya", label: "Jiraiya", anime: "Naruto", icon: Sun, color: "orange" },

  // One Piece
  { id: "luffy", label: "Luffy", anime: "One Piece", icon: Skull, color: "red" },
  { id: "zoro", label: "Zoro", anime: "One Piece", icon: Swords, color: "green" },
  { id: "sanji", label: "Sanji", anime: "One Piece", icon: Flame, color: "yellow" },
  { id: "nami", label: "Nami", anime: "One Piece", icon: Circle, color: "orange" },
  { id: "shanks", label: "Shanks", anime: "One Piece", icon: Swords, color: "red" },
  { id: "law", label: "Law", anime: "One Piece", icon: Heart, color: "yellow" },
  { id: "ace", label: "Ace", anime: "One Piece", icon: Flame, color: "orange" },

  // Demon Slayer
  { id: "nezuko", label: "Nezuko", anime: "Demon Slayer", icon: Heart, color: "rose" },
  { id: "tanjiro", label: "Tanjiro", anime: "Demon Slayer", icon: Droplets, color: "cyan" },
  { id: "zenitsu", label: "Zenitsu", anime: "Demon Slayer", icon: Zap, color: "yellow" },
  { id: "inosuke", label: "Inosuke", anime: "Demon Slayer", icon: Swords, color: "blue" },
  { id: "rengoku", label: "Rengoku", anime: "Demon Slayer", icon: Flame, color: "orange" },
  { id: "shinobu", label: "Shinobu", anime: "Demon Slayer", icon: Moon, color: "purple" },

  // Jujutsu Kaisen
  { id: "gojo", label: "Gojo", anime: "Jujutsu Kaisen", icon: Eye, color: "cyan" },
  { id: "yuji", label: "Yuji", anime: "Jujutsu Kaisen", icon: Shield, color: "rose" },
  { id: "megumi", label: "Megumi", anime: "Jujutsu Kaisen", icon: Ghost, color: "slate" },
  { id: "nobara", label: "Nobara", anime: "Jujutsu Kaisen", icon: Heart, color: "orange" },
  { id: "sukuna", label: "Sukuna", anime: "Jujutsu Kaisen", icon: Skull, color: "red" },

  // Chainsaw Man
  { id: "makima", label: "Makima", anime: "Chainsaw Man", icon: Eye, color: "red" },
  { id: "denji", label: "Denji", anime: "Chainsaw Man", icon: Swords, color: "orange" },
  { id: "power", label: "Power", anime: "Chainsaw Man", icon: Crown, color: "rose" },

  // Attack on Titan
  { id: "eren", label: "Eren", anime: "Attack on Titan", icon: Target, color: "green" },
  { id: "mikasa", label: "Mikasa", anime: "Attack on Titan", icon: Swords, color: "red" },
  { id: "levi", label: "Levi", anime: "Attack on Titan", icon: Wind, color: "green" },

  // Others
  { id: "saitama", label: "Saitama", anime: "One Punch Man", icon: Shield, color: "yellow" },
  { id: "deku", label: "Deku", anime: "My Hero", icon: Zap, color: "green" },
  { id: "elric", label: "Edward", anime: "FMA", icon: Hexagon, color: "red" },
  { id: "light", label: "Light", anime: "Death Note", icon: Moon, color: "slate" },
  { id: "killua", label: "Killua", anime: "HxH", icon: Zap, color: "purple" },
  { id: "gon", label: "Gon", anime: "HxH", icon: Shield, color: "green" },
  { id: "sailormoon", label: "Sailor Moon", anime: "Sailor Moon", icon: Moon, color: "pink" },
  { id: "ichigo", label: "Ichigo", anime: "Bleach", icon: Swords, color: "slate" },
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
  purple: { active: "border-purple-500 bg-purple-500/20 text-purple-100", hover: "hover:border-purple-500/50", icon: "text-purple-400" },
  indigo: { active: "border-indigo-500 bg-indigo-500/20 text-indigo-100", hover: "hover:border-indigo-500/50", icon: "text-indigo-400" },
};

export function CharacterSelector({ value, onChange, disabled }: CharacterSelectorProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 600;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative group/carousel">
      {/* Botão Esquerda */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/90 text-white p-2 rounded-full backdrop-blur-md border border-white/10 opacity-0 group-hover/carousel:opacity-100 transition-opacity disabled:opacity-0"
        type="button"
      >
        ←
      </button>

      {/* Botão Direita */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/90 text-white p-2 rounded-full backdrop-blur-md border border-white/10 opacity-0 group-hover/carousel:opacity-100 transition-opacity disabled:opacity-0"
        type="button"
      >
        →
      </button>

      {/* Container de Scroll */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-3 pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent px-1"
      >
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
                "flex-none w-[110px] md:w-[130px] snap-center flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-300 gap-2 relative overflow-hidden group",
                isSelected
                  ? `${colors.active} shadow-[0_0_15px_rgba(0,0,0,0.5)] scale-105 z-10`
                  : `border-white/5 bg-card/30 hover:bg-card/60 text-muted-foreground ${colors.hover}`,
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className={cn("p-2.5 rounded-full bg-black/40 backdrop-blur-sm transition-transform group-hover:scale-110", isSelected ? colors.icon : "text-muted-foreground group-hover:text-white")}>
                <Icon className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <div className="text-center w-full">
                <span className="text-xs md:text-sm font-bold block truncate w-full px-1">{char.label}</span>
                <span className="text-[9px] md:text-[10px] opacity-70 uppercase tracking-wider truncate block w-full">{char.anime}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
