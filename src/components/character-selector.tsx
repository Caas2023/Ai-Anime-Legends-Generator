"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CharacterSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

import { CHARACTERS } from "@/lib/constants";
export { CHARACTERS };

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
        className="flex overflow-x-auto lg:flex-col lg:overflow-y-auto lg:h-[700px] lg:overflow-x-hidden gap-3 pb-4 lg:pb-0 lg:pr-2 snap-x snap-mandatory lg:snap-y scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent px-1"
      >
        {CHARACTERS.map((char) => {
          const colors = colorClasses[char.color];
          const isSelected = value === char.id;
          
          // Prompt mais específico para garantir unicidade e qualidade
          const safePrompt = `high quality anime face portrait of ${char.label} from ${char.anime}, cinematic lighting, vibrant colors`;
          // Usando um seed baseado no ID do personagem para consistência e links individuais
          const charSeed = char.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
          const photoUrl = `https://pollinations.ai/p/${encodeURIComponent(safePrompt)}?width=300&height=300&nologo=true&seed=${charSeed}`;

          return (
            <button
              key={char.id}
              onClick={() => onChange(char.id)}
              disabled={disabled}
              className={cn(
                "flex-none w-[100px] h-[130px] lg:w-full lg:h-[150px] snap-center flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all duration-300 gap-2 relative overflow-hidden group",
                isSelected
                  ? `${colors.active} shadow-[0_0_20px_rgba(168,85,247,0.4)] scale-105 z-10 lg:scale-[1.03]`
                  : `border-white/5 bg-white/5 hover:bg-white/10 text-muted-foreground ${colors.hover}`,
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className={cn("w-14 h-14 lg:w-16 lg:h-16 rounded-full overflow-hidden border-2 transition-transform duration-500 group-hover:scale-115 shrink-0 bg-black/60 shadow-lg", isSelected ? "border-white" : "border-white/20")}>
                <img 
                  src={photoUrl} 
                  alt={char.label} 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    // Fallback para Iniciais em caso de falha de rede/filtro
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${char.label}&background=1a1a1a&color=fff&size=150`;
                  }}
                />
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
