"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Eye, Play, Sparkles, AlertCircle, Copy, Share2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SafeImage } from "./safe-image";
import { cn } from "@/lib/utils";

interface feedItem {
  id: string;
  image_url: string;
  character_id: string;
  character_name?: string;
  anime_name?: string;
  style_id: string;
  prompt: string;
  is_video: boolean;
  created_at: string;
}

export function CommunityFeed() {
  const [items, setItems] = React.useState<feedItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchFeed = React.useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('community_feed')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setItems(data || []);
    } catch (err: any) {
      console.error("[MURAL ERROR]", err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    fetchFeed();
    
    const channel = supabase
      .channel('feed-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_feed' }, (payload) => {
        setItems(prev => [payload.new as feedItem, ...prev.slice(0, 19)]);
      })
      .subscribe();

    return () => {
      if (supabase) supabase.removeChannel(channel);
    };
  }, [fetchFeed]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="aspect-[3/4] rounded-[2rem] bg-foreground/5 border border-border animate-pulse" />
        ))}
      </div>

    );
  }

  return (
    <div className="w-full space-y-12">
      {!supabase && (
        <div className="glass-panel p-8 rounded-[2rem] border-border text-center space-y-4">
          <div className="flex items-center justify-center gap-3 text-secondary">
             <AlertCircle className="w-5 h-5" />
             <p className="font-black uppercase tracking-widest text-xs">Modo Offline Detectado</p>
          </div>
          <p className="text-[10px] font-bold text-foreground/65 uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
            Configure as chaves do Supabase na Vercel para ativar a sincronização global de lendas.
          </p>
        </div>
      )}


      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative aspect-[3/4] rounded-[2.5rem] overflow-hidden glass-panel border-border shadow-2xl transition-all duration-700 hover:scale-[1.02]"
            >

              <SafeImage
                src={item.image_url}
                alt={item.prompt}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              
              {/* Overlay Premium */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                <div className="space-y-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest dark:brightness-125 brightness-90">
                        {item.character_name || "HERÓI"}
                    </p>
                    <p className="text-[9px] font-bold text-white/85 uppercase tracking-[0.2em] line-clamp-2 italic leading-relaxed">
                        "{item.prompt}"
                    </p>

                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      className="w-8 h-8 rounded-full glass-panel flex items-center justify-center hover:bg-white text-white hover:text-black transition-all"
                      onClick={() => window.open(item.image_url, '_blank')}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      className="w-8 h-8 rounded-full glass-panel flex items-center justify-center hover:bg-white text-white hover:text-black transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(item.prompt);
                      }}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      className="w-8 h-8 rounded-full glass-panel flex items-center justify-center hover:bg-white text-white hover:text-black transition-all"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = item.image_url;
                        link.download = `legend-${item.id}.jpg`;
                        link.click();
                      }}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Video Indicator */}
              {item.is_video && (
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full glass-panel flex items-center justify-center border-white/30 bg-black/40">
                  <Play className="w-3 h-3 text-white fill-current" />
                </div>
              )}

            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {items.length === 0 && supabase && (
        <div className="w-full py-32 glass-panel rounded-[3rem] border-border flex flex-col items-center justify-center text-center">
          <Sparkles className="w-12 h-12 text-foreground/10 mb-6" />
          <p className="text-[11px] font-black text-foreground/45 uppercase tracking-[0.5em]">O Vazio das Lendas</p>
          <p className="text-[10px] font-bold text-foreground/35 uppercase tracking-widest mt-4">Nenhuma criação manifestada ainda</p>
        </div>
      )}

    </div>
  );
}
