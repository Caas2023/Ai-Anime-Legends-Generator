"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione um arquivo de imagem.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="w-full relative group">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleChange}
        disabled={disabled}
      />

      <AnimatePresence mode="wait">
        {value ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full aspect-video rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group/preview"
            onClick={() => !disabled && inputRef.current?.click()}
          >
            <img
              src={value}
              alt="Upload preview"
              className="object-cover w-full h-full transition-transform duration-700 group-hover/preview:scale-105"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
              <p className="text-xs font-black uppercase tracking-widest text-white">Alterar Fragmento</p>
            </div>
            {!disabled && (
              <button
                onClick={removeImage}
                className="absolute top-4 right-4 w-10 h-10 glass-panel flex items-center justify-center text-white rounded-full hover:bg-red-500 transition-all z-20"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            className={cn(
              "relative flex flex-col items-center justify-center w-full aspect-video rounded-[2rem] border transition-all duration-500 overflow-hidden",
              dragActive
                ? "bg-white/[0.05] border-white/20 scale-[1.02]"
                : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
            )}
            onClick={() => !disabled && inputRef.current?.click()}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
              <div className={cn(
                "w-16 h-16 rounded-[1.5rem] glass-panel border-white/5 flex items-center justify-center transition-all duration-500",
                dragActive ? "scale-110 text-primary shadow-[0_0_30px_rgba(var(--primary),0.3)]" : "text-white/20"
              )}>
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-white transition-colors">
                  Infundir Essência
                </p>
                <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-3 h-3 text-secondary animate-pulse" />
                    <p className="text-[8px] font-bold uppercase tracking-widest text-white/20">
                      Arraste ou clique para enviar
                    </p>
                </div>
              </div>
            </div>
            
            {/* Background Glow */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 blur-[80px] -z-10" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

