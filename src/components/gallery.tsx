"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Download, Copy, Sparkles } from "lucide-react";
import { GalleryItem } from "@/hooks/use-gallery";
import { cn } from "@/lib/utils";
import { CHARACTERS } from "@/lib/constants";

interface GalleryProps {
    images: GalleryItem[];
    onRemove: (id: string) => void;
    onSelect?: (url: string) => void;
}

export function Gallery({ images, onRemove, onSelect }: GalleryProps) {
    if (images.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full"
        >
            <div className="flex overflow-x-auto gap-6 pb-8 custom-scrollbar snap-x px-4">
                <AnimatePresence mode="popLayout">
                    {images.map((img, index) => (
                        <motion.div
                            key={img.id}
                            initial={{ opacity: 0, x: 20, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                            transition={{ delay: index * 0.05 }}
                            layout
                            className="relative group flex-none w-[180px] aspect-[3/4] rounded-[2rem] overflow-hidden glass-panel border-white/5 cursor-pointer snap-center shadow-2xl"
                            onClick={() => onSelect && onSelect(img.url)}
                        >
                            {/* Base Image */}
                            <img
                                src={img.url}
                                alt="Memory Fragment"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Aura Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end gap-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const link = document.createElement("a");
                                            link.href = img.url;
                                            link.download = `anime-legends-${img.id}.jpg`;
                                            link.click();
                                        }}
                                        className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-white text-white hover:text-black transition-all"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                    
                                    {img.prompt && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigator.clipboard.writeText(img.prompt);
                                            }}
                                            className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-secondary text-white hover:text-black transition-all"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    )}

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemove(img.id);
                                        }}
                                        className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-red-500 text-white transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Character Magic Label */}
                            <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/40 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/10 pointer-events-none">
                                <Sparkles className="w-2.5 h-2.5 text-primary" />
                                <span className="text-[8px] font-black text-white uppercase tracking-widest">
                                    {CHARACTERS.find(c => c.id === img.character)?.label || "Lenda"}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

