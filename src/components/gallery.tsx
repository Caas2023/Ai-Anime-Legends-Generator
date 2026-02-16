"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Trash2, Download, Image as ImageIcon, X, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { GalleryItem } from "@/hooks/use-gallery";
import { cn } from "@/lib/utils";
import { CHARACTERS } from "@/components/character-selector";
import { ART_STYLES } from "@/components/model-selector";

interface GalleryProps {
    images: GalleryItem[];
    onRemove: (id: string) => void;
    onSelect?: (url: string) => void;
}

export function Gallery({ images, onRemove, onSelect }: GalleryProps) {
    if (images.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-4 mt-12 border-t border-white/10 pt-8"
        >
            <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    Sua Coleção
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/60 font-mono">
                        {images.length}
                    </span>
                </h3>
            </div>

            <ScrollArea className="w-full whitespace-nowrap rounded-2xl border border-white/5 bg-black/20 p-4">
                <div className="flex w-max space-x-4">
                    <AnimatePresence mode="popLayout">
                        {images.map((img) => (
                            <motion.div
                                key={img.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8, width: 0 }}
                                layout
                                className="relative group w-[150px] aspect-[3/4] rounded-xl overflow-hidden bg-black/50 border border-white/10 shrink-0 cursor-pointer"
                                onClick={() => onSelect && onSelect(img.url)}
                            >
                                <Image
                                    src={img.url}
                                    alt="Gallery Item"
                                    fill
                                    sizes="(max-width: 768px) 150px, 200px"
                                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                                />

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                                    <div className="flex flex-wrap items-center justify-center gap-2">
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            className="h-8 w-8 rounded-lg shadow-lg"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRemove(img.id);
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>

                                        {img.prompt && (
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 rounded-lg shadow-lg bg-white/10 hover:bg-white/20 text-white"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigator.clipboard.writeText(img.prompt);
                                                    // Simple feedback
                                                    const btn = e.currentTarget;
                                                    const originalInner = btn.innerHTML;
                                                    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check text-green-400"><path d="M20 6 9 17l-5-5"/></svg>';
                                                    setTimeout(() => { btn.innerHTML = originalInner; }, 2000);
                                                }}
                                                title="Copiar Prompt"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                        )}

                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="h-8 w-8 rounded-lg shadow-lg"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const link = document.createElement("a");
                                                link.href = img.url;
                                                link.download = `anime-legends-${img.id}.jpg`;
                                                link.click();
                                            }}
                                        >
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Badge */}
                                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 pointer-events-none">
                                    <span className="text-[10px] font-bold text-white uppercase block">
                                        {CHARACTERS.find(c => c.id === img.character)?.label || "?"}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
                <ScrollBar orientation="horizontal" className="bg-white/5" />
            </ScrollArea>
        </motion.div>
    );
}
