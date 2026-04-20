"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, Sparkles } from "lucide-react";

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackName?: string;
  onLoad?: () => void;
}

export function SafeImage({ src, alt, className, fallbackName, onLoad }: SafeImageProps) {
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
        <div className="absolute inset-0 flex items-center justify-center animate-pulse bg-white/5 z-10">
          <Sparkles className="w-5 h-5 text-white/20" />
        </div>
      )}
      
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center bg-zinc-900/80">
          <img 
            src={fallbackUrl} 
            alt="Fallback" 
            className="w-full h-full object-cover opacity-40 grayscale" 
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-white/20" />
          </div>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-all duration-700",
            loading ? "opacity-0 scale-110" : "opacity-100 scale-100"
          )}
          onLoad={() => {
            setLoading(false);
            onLoad?.();
          }}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
        />
      )}
    </div>
  );
}
