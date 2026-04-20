"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Play, Eye, Download, Share2, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface feedItem {
  id: string;
  image_url: string;
  prompt: string;
  character_id: string;
  style_id: string;
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
      // Se o erro for de tabela não encontrada, setItems([]) fará mostrar "Mural Vazio"
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
    
    // Subscribe to new items
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
      <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-2xl transition-all hover:border-primary/40"
            >
              <img
                src={item.image_url}
                alt={item.prompt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {item.character_id}
                    </span>
                    {item.is_video && (
                      <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center">
                        <Play className="w-2 h-2 mr-1 fill-current" /> Vídeo
                      </span>
                    )}
                  </div>
                  <p className="text-white/70 text-xs line-clamp-2 leading-tight font-medium italic">
                    "{item.prompt}"
                  </p>
                  
                  <div className="flex items-center gap-2 pt-1">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white"
                      onClick={() => window.open(item.image_url, '_blank')}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = item.image_url;
                        link.download = `legend-${item.id}.jpg`;
                        link.click();
                      }}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tag de Vídeo Permanente (Opaca) */}
              {item.is_video && (
                <div className="absolute top-2 right-2 bg-purple-600/80 backdrop-blur-md p-1.5 rounded-lg shadow-lg group-hover:opacity-0 transition-opacity">
                  <Play className="w-3 h-3 text-white fill-current" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {items.length === 0 && (
        <div className="w-full flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.02]">
          <Sparkles className="w-12 h-12 text-white/5 mb-4" />
          <p className="text-white/20 font-bold uppercase tracking-[0.3em] text-sm text-center">
            O Mural está vazio.<br />Seja o primeiro a criar uma lenda!
          </p>
        </div>
      )}
    </div>
  );
}
