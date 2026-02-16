"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export type AnimeStyle = {
  id: string;
  name: string;
  description: string;
  color: string;
  prompt: string;
};

export const ANIME_STYLES: AnimeStyle[] = [
  {
    id: "naruto",
    name: "Ninja Way",
    description: "Kishimoto style with headband",
    color: "from-orange-500 to-yellow-500",
    prompt: "naruto style, anime style, ninja headband, cell shaded, masashi kishimoto art style",
  },
  {
    id: "dbz",
    name: "Saiyan Power",
    description: "Toriyama style, sharp angles",
    color: "from-orange-600 to-red-600",
    prompt: "dragon ball z style, anime style, akira toriyama art style, sharp angles, muscular, super saiyan aura",
  },
  {
    id: "one_piece",
    name: "Pirate King",
    description: "Oda style, expressive",
    color: "from-blue-500 to-cyan-400",
    prompt: "one piece style, anime style, eiichiro oda art style, exaggerated features, vibrant colors",
  },
  {
    id: "ghibli",
    name: "Spirit World",
    description: "Miyazaki soft & paint style",
    color: "from-green-400 to-emerald-600",
    prompt: "studio ghibli style, anime style, hayao miyazaki art style, soft lighting, detailed background, oil painting texture",
  },
  {
    id: "cyberpunk",
    name: "Night City",
    description: "Edgerunners neon style",
    color: "from-pink-500 to-yellow-400",
    prompt: "cyberpunk edgerunners style, anime style, trigger studio art style, neon lights, chromatic aberration, futuristic",
  },
  {
    id: "jojo",
    name: "Bizarre",
    description: "Araki bold shading",
    color: "from-purple-600 to-pink-600",
    prompt: "jojo's bizarre adventure style, anime style, hirohiko araki art style, heavy shading, dramatic posing, menacing characters",
  },
];

interface StyleSelectorProps {
  selectedStyle: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export function StyleSelector({ selectedStyle, onSelect, disabled }: StyleSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {ANIME_STYLES.map((style) => (
        <motion.div
          key={style.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => !disabled && onSelect(style.id)}
          className={cn(
            "relative group cursor-pointer overflow-hidden rounded-xl border-2 p-4 transition-all duration-300",
            selectedStyle === style.id
              ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(124,58,237,0.3)]"
              : "border-border bg-card/40 hover:border-primary/50 hover:bg-card/60"
          )}
        >
          <div className={cn(
            "absolute inset-0 opacity-10 bg-gradient-to-br transition-opacity duration-300",
            style.color,
            selectedStyle === style.id ? "opacity-20" : "group-hover:opacity-15"
          )} />
          
          <div className="relative flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground">{style.name}</h3>
              {selectedStyle === style.id && (
                <div className="bg-primary rounded-full p-1">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{style.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
