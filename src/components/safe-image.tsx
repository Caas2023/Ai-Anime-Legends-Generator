"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

import { AlertCircle, Sparkles } from "lucide-react";

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackName?: string;
  onLoad?: () => void;
  sizes?: string;
}

export function SafeImage({ src, alt, className, fallbackName, onLoad, sizes }: SafeImageProps) {
  const [error, setError] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  // Reiniciar estado se o src mudar
  React.useEffect(() => {
    setError(false);
    setLoading(true);
  }, [src]);

  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName || alt)}&background=1a1a1a&color=fff&size=200&bold=true`;

  return (
    <div className={cn("relative overflow-hidden bg-black/20", className)}>
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center animate-pulse bg-foreground/5 z-10">
          <Sparkles className="w-5 h-5 text-foreground/25" aria-hidden="true" />
        </div>
      )}

      
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center bg-zinc-900/80">
          <img 
            src={fallbackUrl} 
            alt="" 
            role="presentation"
            className="w-full h-full object-cover opacity-20 grayscale" 
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <AlertCircle className="w-5 h-5 text-red-500/60 mb-2" aria-hidden="true" />
            <p className="text-[9px] text-foreground/65 uppercase font-bold tracking-tight">
              Imagem Não Carregou
            </p>
            <button 
                onClick={() => { setError(false); setLoading(true); }}
                className="mt-2 text-[8px] text-primary/80 hover:text-primary transition-colors uppercase font-bold"
                aria-label="Tentar recarregar imagem"
            >
                Tentar Recarregar
            </button>
          </div>

        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized={src.startsWith('http')} 
          decoding="async"
          loading="lazy"
          sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 150px"}
          className={cn(
            "object-cover transition-opacity duration-300",
            error ? "opacity-0" : "opacity-100"
          )}
          onLoad={() => {
            setLoading(false);
            onLoad?.();
          }}
          onError={(e) => {
            console.error(`[IMAGE_FAIL] Falha ao carregar: ${src}`);
            setError(true);
            setLoading(false);
          }}
        />

      )}
    </div>
  );
}
