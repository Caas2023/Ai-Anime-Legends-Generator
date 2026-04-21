"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { 
    Wand2, 
    Download, 
    RefreshCw, 
    Sparkles, 
    AlertCircle, 
    Share2, 
    Copy, 
    Video, 
    Settings, 
    X,
    Check
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";


import { CharacterSelector } from "@/components/character-selector";
import { ModelSelector } from "@/components/model-selector";
import { CHARACTERS, ART_STYLES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { generateImage, composePrompt } from "@/actions/generate";
import { useGallery } from "@/hooks/use-gallery";
import { useSound } from "@/hooks/use-sound";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";

// Otimização de Performance: Lazy loading de componentes pesados fora do viewport inicial
const CommunityFeed = dynamic(() => import("@/components/community-feed").then(mod => mod.CommunityFeed), { ssr: false });
const Gallery = dynamic(() => import("@/components/gallery").then(mod => mod.Gallery), { ssr: false });

// NÚCLEO DE INTELIGÊNCIA: Protocolo de Invocação Elite (@senior-prompt-engineer v8.4.1)
const SYSTEM_OPTIMIZER_PROMPT = `As a World-Class AI Prompt Engineer for High-End Anime Art, your mission is to merge Character context, Art Style, and User Requests into a single production-grade image prompt.
RULES:
1. CORE CONTEXT: Use the provided Character and Art Style as the foundation.
2. ACTION FUSION: Integrate the user's request naturally.
3. LANGUAGE: You MUST translate everything to English. NO Portuguese or other languages in the output.
4. STRUCTURE: Describe the Character (outfit, pose) -> Action (translated to English) -> Environment -> Lighting -> Tech Specs.
5. STYLE ADHERENCE: Use 90s aesthetic for Retro, neon for Cyberpunk, etc.
6. OUTPUT: Return ONLY the final detailed prompt in English, no explanations. 
   Example Output: "Naruto Uzumaki in his orange jumpsuit, holding a fluffy Shiba Inu dog, Konoha village background, soft sunlight filtering through trees, vibrant anime colors, 8k, masterpiece".`;


const IMAGE_SIZES = [
  { id: "portrait", label: "Retrato (3:4)", width: 768, height: 1024, icon: "📱" },
  { id: "square", label: "Quadrado (1:1)", width: 1024, height: 1024, icon: "🟦" },
  { id: "landscape", label: "Paisagem (4:3)", width: 1024, height: 768, icon: "🖼️" },
  { id: "story", label: "Story (9:16)", width: 576, height: 1024, icon: "🤳" },
  { id: "wide", label: "Wide (16:9)", width: 1024, height: 576, icon: "📺" },
];

export default function Home() {
  const shouldReduceMotion = useReducedMotion();
  const [selectedCharacter, setSelectedCharacter] = React.useState<string>("goku");
  const [selectedStyle, setSelectedStyle] = React.useState<string>("flux");
  const [selectedSize, setSelectedSize] = React.useState(IMAGE_SIZES[0]);
  const [customPrompt, setCustomPrompt] = React.useState<string>("");
  const [isEnhancing, setIsEnhancing] = React.useState(false);
  const [generatedImage, setGeneratedImage] = React.useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [apiKey, setApiKey] = React.useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = React.useState<string | null>(null);

  // Model Selection (BYOP VIP)
  const [showSettings, setShowSettings] = React.useState(false);
  const [imageModel, setImageModel] = React.useState("flux");
  const [videoModel, setVideoModel] = React.useState("ltx");
  const { play } = useSound();
  const { images, addImage, removeImage } = useGallery();

  // PWA Support States
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = React.useState(false);

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if not already in standalone mode
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      if (!isStandalone) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    }
  };


  React.useEffect(() => {
    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW registration failed:', err));
      });
    }

    // Check url fragment for api_key
    if (typeof window !== "undefined") {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const hashKey = hashParams.get('api_key');
      if (hashKey) {
        setApiKey(hashKey);
        localStorage.setItem('pollinations_api_key', hashKey);
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      } else {
        const stored = localStorage.getItem('pollinations_api_key');
        if (stored) setApiKey(stored);
      }
    }
  }, []);

  const handleLogin = () => {
    const params = new URLSearchParams({
      redirect_url: window.location.href.split('#')[0]
    });
    window.location.href = `https://enter.pollinations.ai/authorize?${params}`;
  };

  const handleLogout = () => {
    setApiKey(null);
    localStorage.removeItem('pollinations_api_key');
  };

  const handleEnhance = async () => {
    if (!customPrompt.trim()) return;
    setIsEnhancing(true);
    play("click");

    // Context Retrieval (v8.4)
    const characterData = CHARACTERS.find(c => c.id === selectedCharacter);
    const styleData = ART_STYLES.find(s => s.id === selectedStyle);
    const contextInfo = `Context: Character ${characterData?.label} (${characterData?.anime} anime), Art Style: ${styleData?.label}. User Request: ${customPrompt}`;

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

      const res = await fetch("https://gen.pollinations.ai/v1/chat/completions", {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: "openai",
          messages: [
            { role: "system", content: SYSTEM_OPTIMIZER_PROMPT },
            { role: "user", content: `Integrate and expand this context into a masterpiece anime prompt: ${contextInfo}` }
          ],
          seed: Math.floor(Math.random() * 999999)
        })
      });
      if (res.ok) {
        const json = await res.json();
        const enhanced = json?.choices?.[0]?.message?.content?.trim() || customPrompt;
        setCustomPrompt(enhanced);
        play("success");
      } else {
        const fallback = `${customPrompt}, ultra detailed, cinematic lighting, dramatic atmosphere, masterpiece, 8k resolution`;
        setCustomPrompt(fallback);
        play("success");
      }
    } catch (err) {
      console.error(err);
      const fallback = `${customPrompt}, ultra detailed, cinematic lighting, dramatic atmosphere, masterpiece, 8k resolution`;
      setCustomPrompt(fallback);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);
    setGeneratedImage(null);
    setGeneratedVideo(null);
    setCurrentPrompt(null);

    const result = await generateImage(selectedCharacter, selectedStyle, customPrompt, selectedSize.width, selectedSize.height, apiKey || undefined, apiKey ? imageModel : undefined);

    if (result.success && result.imageUrl) {
      setGeneratedImage(result.imageUrl);
      setCurrentPrompt(result.prompt as string);
      addImage(result.imageUrl, selectedCharacter, selectedStyle, result.prompt as string);
      play("success");
    } else {
      setError(result.error || "Algo deu errado");
      play("error");
    }

    setIsGenerating(false);
  };

  const handleGenerateVideo = async () => {
    if (!apiKey) return;
    setError(null);
    setIsGeneratingVideo(true);
    setGeneratedImage(null);
    setGeneratedVideo(null);
    setCurrentPrompt(null);
    play("click");

    try {
      const finalPrompt = await composePrompt(selectedCharacter, selectedStyle, customPrompt);
      setCurrentPrompt(finalPrompt);

      const truncated = finalPrompt.substring(0, 500);
      const encoded = encodeURIComponent(truncated);
      const seed = Math.floor(Math.random() * 999999);
      
      const url = `https://gen.pollinations.ai/video/${encoded}?seed=${seed}&model=${videoModel}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: { "Authorization": `Bearer ${apiKey}` }
      });

      if (!response.ok) {
        throw new Error("Falha ao gerar o vídeo. Tente novamente.");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      setGeneratedVideo(objectUrl);
      play("success");

      // Salva no Mural (Silencioso)
      if (supabase) {
        supabase.from('community_feed').insert({
          image_url: url, // Link direto e permanente do Pollinations
          character_id: selectedCharacter,
          style_id: selectedStyle,
          prompt: finalPrompt,
          is_video: true
        }).then(() => console.log("[MURAL] Vídeo compartilhado"));
      }
    } catch (err: any) {
      setError(err.message || "Algo deu errado na geração de vídeo");
      play("error");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    play("click");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedImage && !generatedVideo) return;
    const link = document.createElement("a");
    link.href = generatedVideo || generatedImage!;
    link.download = `anime-legends-${selectedCharacter}-${Date.now()}.${generatedVideo ? 'mp4' : 'jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async (platform: 'whatsapp' | 'facebook' | 'general') => {
    if (!generatedImage && !generatedVideo) return;

    if (platform === 'general' && navigator.share) {
      try {
        const response = await fetch(generatedVideo || generatedImage!);
        const blob = await response.blob();
        const file = new File([blob], `anime-art.${generatedVideo ? 'mp4' : 'jpg'}`, { type: generatedVideo ? 'video/mp4' : 'image/jpeg' });
        await navigator.share({
          files: [file],
          title: 'Minha Arte Anime',
          text: 'Olha que incrível essa arte que eu criei!',
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
      return;
    }

    const text = encodeURIComponent("Olha que incrível essa arte que eu criei no Anime Photo Transformer!");
    const url = encodeURIComponent(window.location.href);

    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${text}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    }
  };

  return (
    <main 
      id="main-content" 
      tabIndex={-1} 
      className="min-h-screen bg-background text-foreground selection:bg-primary/30 relative overflow-x-hidden font-sans focus:outline-none scroll-smooth snap-container"
    >

      
      {/* Notificação de Erro (Alerta Místico) */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-6 text-center"
          >
            <div className="glass-panel border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.2)] p-6 rounded-3xl flex items-center gap-6 text-left">
              <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500 animate-pulse flex-shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-red-400">Desequilíbrio Neural</p>
                <p className="text-sm text-white/70 font-medium leading-relaxed mt-1">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-white/20 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Background Animado "Neural Nebula" */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-mesh opacity-40 mix-blend-screen dark:mix-blend-screen mix-blend-multiply" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,var(--background)_100%)]" />

      </div>

      <div className="container max-w-[1700px] mx-auto px-4 py-4 relative z-10">

        {/* Controle Superior (Configurações e Auth) */}
        {/* Painel de Configurações Lateral (Gerenciado pelo Header) */}
        <AnimatePresence>
            {showSettings && (
                <motion.div
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    className="fixed top-24 right-8 z-[100] glass-panel p-6 rounded-[2rem] border-primary/20 shadow-2xl w-72"
                >
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Núcleo de Imagem</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {['flux', 'flux-realism', 'openai', 'any-dark'].map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setImageModel(m)}
                                        disabled={isGenerating}
                                        aria-label={`Selecionar modelo ${m}`}
                                        className={cn(
                                            "px-3 py-2 rounded-xl border text-[9px] font-black uppercase tracking-tighter transition-all",
                                            imageModel === m ? "bg-primary border-transparent text-primary-foreground" : "bg-foreground/5 border-border text-foreground/40 hover:text-foreground"
                                        )}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Fluxo de Vídeo</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {['ltx', 'raycast', 'pika'].map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setVideoModel(m)}
                                        className={cn(
                                            "px-3 py-2 rounded-xl border text-[9px] font-black uppercase tracking-tighter transition-all",
                                            videoModel === m ? "bg-secondary border-transparent text-secondary-foreground" : "bg-foreground/5 border-border text-foreground/40 hover:text-foreground"
                                        )}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>


        <header className="sticky top-0 z-[50] flex items-center justify-between py-4 mb-8 bg-background/80 backdrop-blur-xl border-b border-white/5 -mx-4 px-4 h-16">
            <div className="flex items-center gap-4">
                <h1 className="text-3xl font-black tracking-tighter uppercase text-primary">
                    Ai Anime Legends
                </h1>
            </div>

            <div className="flex items-center gap-3">
                {apiKey ? (
                    <div className="flex items-center gap-3 glass-panel pl-2 pr-5 py-1.5 rounded-full border-primary/20">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <Check className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[7px] font-black uppercase tracking-widest text-primary/70 leading-none">Fluxo Ativo</span>
                            <button onClick={handleLogout} className="text-[8px] font-black uppercase text-muted-foreground hover:text-destructive transition-colors text-left leading-none mt-0.5">Desconectar</button>
                        </div>
                    </div>
                ) : (
                    <Button
                        variant="ghost"
                        onClick={handleLogin}
                        className="glass-panel px-6 h-11 rounded-full font-black uppercase text-[9px] tracking-[0.2em] hover:border-primary/50 transition-all group border-primary/10"
                    >
                        <Wand2 className="w-3.5 h-3.5 mr-2 group-hover:animate-pulse text-primary" aria-hidden="true" />
                        Conectar Pollinations
                    </Button>
                )}

                <div className="h-4 w-px bg-border/50 mx-1" />
                <ThemeToggle />
                
                <Button
                    size="icon"
                    variant="ghost"
                    className={cn(
                        "w-11 h-11 rounded-full glass-panel hover:text-primary transition-all",
                        showSettings && "bg-primary/10 border-primary/30 text-primary"
                    )}
                    onClick={() => setShowSettings(!showSettings)}
                    aria-label="Configurações"
                >

                    <Settings className={cn("w-5 h-5 transition-transform duration-500", showSettings && "rotate-90")} aria-hidden="true" />
                </Button>
            </div>
        </header>



        <div className="relative pb-40 lg:pb-32 space-y-16 safe-padding-bottom">
          {/* Sessão 1: Workstation */}
          <section id="workstation" className="scroll-mt-24 snap-section">
              <motion.div
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8"
              >
                {/* Coluna 1: O Herói (Esquerda) */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="lg:col-span-2 space-y-6"
                >
                    <div className="flex items-center gap-4 group" aria-label="Etapa 1: Seleção do Herói">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-background font-black text-xs" aria-hidden="true">1</div>
                    <h2 className="text-lg font-black tracking-tighter uppercase text-primary">O Herói</h2>
                  </div>



                  <div className="celestial-card p-1 overflow-hidden">
                    <CharacterSelector
                      value={selectedCharacter}
                      onChange={(val) => { setSelectedCharacter(val); play("click"); }}
                      disabled={isGenerating || isGeneratingVideo}
                    />
                  </div>
                </motion.div>

                {/* Coluna 2: Configurações (Meio) */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="lg:col-span-4 space-y-5"
                >
                  <fieldset className="space-y-3 border-none p-0 m-0">
                    <legend className="sr-only">Escolha o Estilo Artístico</legend>
                    <div className="flex items-center gap-2 group" aria-label="Etapa 2: Escolha do Estilo">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-background font-black text-[10px] shadow-[0_0_15px_var(--accent-glow)]" aria-hidden="true">2</div>
                      <h2 className="text-sm font-black tracking-tighter uppercase text-primary">Estilos</h2>
                    </div>

                    <div className="celestial-card p-3">
                      <ModelSelector
                        value={selectedStyle}
                        onChange={(val) => { setSelectedStyle(val); play("click"); }}
                        disabled={isGenerating || isGeneratingVideo}
                      />
                    </div>
                  </fieldset>


                  <fieldset className="space-y-3 border-none p-0 m-0">
                    <legend className="sr-only">Escolha a Razão de Aspecto</legend>
                    <div className="flex items-center gap-2 group" aria-label="Etapa 3: Razão de Aspecto">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-background font-black text-[10px] shadow-[0_0_15px_var(--accent-glow)]" aria-hidden="true">3</div>
                      <h2 className="text-sm font-black tracking-tighter uppercase text-primary">Tamanhos</h2>
                    </div>

                    <div className="grid grid-cols-5 gap-1 celestial-card p-1">
                      {IMAGE_SIZES.map((size) => (
                        <button
                          key={size.id}
                          aria-label={`Proporção: ${size.label}`}
                          className={cn(
                            "flex flex-col items-center justify-center py-2.5 rounded-xl transition-all border",
                            selectedSize.id === size.id
                              ? "bg-primary text-primary-foreground border-transparent shadow-lg"
                              : "bg-surface border-border text-foreground hover:bg-muted"
                          )}
                          onClick={() => { setSelectedSize(size); play("click"); }}
                          disabled={isGenerating}
                        >
                          <span className="text-lg mb-0.5" aria-hidden="true">{size.icon}</span>
                          <span className="text-[7px] uppercase font-black tracking-widest">{size.label.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </fieldset>


                  <div className="space-y-3">
                    <div className="flex items-center gap-2 group" aria-label="Etapa 4: Detalhes e Invocação">
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-background font-black text-[10px] shadow-[0_0_15px_var(--accent-glow)]" aria-hidden="true">4</div>
                      <h2 className="text-sm font-black tracking-tighter uppercase text-primary">Detalhes</h2>
                    </div>



                    <div className="relative group/input">
                      <Input
                        placeholder="Ex: Segurando espada de gelo..."
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        className="glass-panel h-11 rounded-xl border-border focus:border-primary/50 text-[10px] px-4 uppercase font-black tracking-widest placeholder:text-foreground/70"

                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-3 hover:bg-cyan-500/10 text-cyan-400 font-black text-[8px] uppercase tracking-widest rounded-lg"
                        onClick={handleEnhance}
                        disabled={isGenerating || isEnhancing || !customPrompt.trim()}
                      >
                        {isEnhancing ? "..." : "Otimizar"}
                      </Button>
                    </div>
                  </div>

                  {currentPrompt && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full glass-panel p-4 rounded-2xl border-white/5 relative group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-secondary uppercase tracking-[0.3em] font-mono">Fórmula Celestial</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-3 text-[8px] font-black bg-secondary/20 hover:bg-secondary/30 text-secondary-foreground rounded-full transition-all uppercase tracking-widest"
                          onClick={() => handleCopyPrompt(currentPrompt!)}
                        >
                          {copied ? "Sincronizado" : "Capturar Prompt"}
                        </Button>
                      </div>
                      <p className="text-[11px] text-foreground font-bold leading-relaxed italic truncate opacity-100">"{currentPrompt}"</p>



                    </motion.div>
                  )}
                </motion.div>

                {/* Coluna 3: Preview + Ações (Direita) */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="lg:col-span-6 flex flex-col gap-4"
                >
                  <Card className="celestial-card relative flex-1 min-h-[300px] lg:min-h-[400px] overflow-hidden shadow-2xl border-border">


                    <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
                    {generatedImage || generatedVideo ? (
                      <div className="relative w-full h-full p-2 group/image">
                        {generatedVideo ? (
                          <video 
                            src={generatedVideo} 
                            controls 
                            autoPlay 
                            loop 
                            playsInline 
                            className="object-contain w-full h-full rounded-[2rem] bg-black dark:brightness-[0.85] dark:contrast-[1.05] hover:brightness-100 transition-all duration-300" 
                          />
                        ) : (
                          <div className="relative w-full h-full">
                            <Image 
                              src={generatedImage!} 
                              alt={`Arte Anime Gerada: ${selectedCharacter} em estilo ${selectedStyle}`} 
                              fill
                              priority
                              loading="eager" // Força o carregamento imediato para LCP
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                              className="object-contain rounded-[2rem] dark:brightness-[0.85] dark:contrast-[1.05] hover:brightness-100 transition-all duration-300" 
                            />
                          </div>
                        )}


                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover/image:opacity-100 transition-opacity">
                          <Button 
                            size="icon" 
                            variant="secondary" 
                            onClick={handleDownload} 
                            aria-label="Baixar arte gerada"
                            className="w-10 h-10 rounded-full shadow-xl"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : isGenerating || isGeneratingVideo ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-black/20">
                        <div className="relative w-20 h-20 mb-4">
                          <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-ping" />
                          <div className="absolute inset-0 border-2 border-t-secondary border-l-primary rounded-full animate-spin" />
                          <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-secondary animate-pulse" aria-hidden="true" />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-glow" aria-live="polite">Manifestando...</h3>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center opacity-30">
                        <div className="w-16 h-16 glass-panel rounded-3xl flex items-center justify-center mb-6 rotate-12 celestial-border">
                          <Sparkles className="w-6 h-6 text-white" aria-hidden="true" />
                        </div>
                        <h3 className="text-xs font-black tracking-widest uppercase">Visualizador</h3>
                      </div>
                    )}
                  </Card>

                  {/* Ações Fixas (Garantir Visibilidade) */}
                  <div className="sticky bottom-0 space-y-4 pt-4 bg-background/50 backdrop-blur-xl -mx-2 px-2 pb-2 rounded-t-3xl z-20 border-t border-border/50">
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                        onClick={() => { handleGenerate(); play("click"); }}
                        className="h-14 rounded-2xl bg-cta-photo text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-cta-photo/20"
                        disabled={isGenerating || isGeneratingVideo}
                        >
                        <Wand2 className="w-4 h-4 mr-2" /> Gerar Foto
                        </Button>
                        <Button
                        onClick={() => { if (apiKey) handleGenerateVideo(); }}
                        className={cn(
                            "h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-2xl",
                            apiKey ? "bg-cta-video text-white shadow-cta-video/20 hover:scale-[1.02]" : "bg-muted text-muted-foreground border-border cursor-not-allowed"
                        )}
                        disabled={isGenerating || isGeneratingVideo || !apiKey}
                        >
                        <Video className="w-4 h-4 mr-2" /> Gerar Vídeo
                        </Button>
                    </div>

                    {(currentPrompt || generatedImage) && (
                        <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-panel p-3 rounded-2xl border-border bg-card shadow-lg"
                        >
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">IA Formula</span>
                            <button onClick={() => handleCopyPrompt(currentPrompt || "")} className="text-[8px] font-black hover:text-primary text-foreground uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                            <Copy className="w-2.5 h-2.5" /> {copied ? "Sincronizado" : "Copiar"}
                            </button>
                        </div>

                        <p className="text-[11px] text-foreground font-medium leading-relaxed italic line-clamp-2">"{currentPrompt || "Aguardando invocação..."}"</p>
                        </motion.div>
                    )}
                   </div>
                </motion.div>
            </motion.div>
          </section>

          {/* Sessão 2: Galeria */}
          <section id="gallery" className="scroll-mt-24 pt-8 border-t border-border/30 snap-section">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="py-8"
              >
                <div className="flex flex-col gap-4 mb-8">
                  <h2 className="text-3xl font-black uppercase tracking-tighter">Seus Fragmentos</h2>
                  <p className="text-[10px] font-black text-foreground/70 uppercase tracking-[0.4em]">Criações locais desta sessão</p>
                </div>
                <Gallery
                  images={images}
                  onRemove={removeImage}
                  onSelect={(url) => {
                    setGeneratedImage(url);
                    const item = images.find(img => img.url === url);
                    if (item?.prompt) setCurrentPrompt(item.prompt);
                    document.getElementById('workstation')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                />
              </motion.div>
          </section>

          {/* Sessão 3: Mural */}
          <section id="mural" className="scroll-mt-24 pt-8 border-t border-border/30 pb-20 snap-section">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="flex flex-col items-center gap-12 pt-12">
                  <div className="flex flex-col items-center text-center space-y-4">
                  <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">O Mural</h2>
                  <p className="text-[10px] font-black text-foreground/65 uppercase tracking-[0.6em]">Conexão Neural Global</p>
                  </div>
                  <CommunityFeed />
                </div>
              </motion.div>
          </section>
        </div>

        {/* PWA Install Banner (Industrial Design) */}
        <AnimatePresence>
          {showInstallBanner && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-20 left-4 right-4 z-[150] lg:hidden"
            >
              <div className="glass-panel p-4 rounded-3xl border-primary/40 bg-background/80 backdrop-blur-3xl shadow-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">App Industrial</h4>
                    <p className="text-[8px] font-bold text-foreground/60 uppercase tracking-tighter">Instale no seu Android</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowInstallBanner(false)}
                    className="h-9 px-3 text-[8px] font-black uppercase text-foreground/40"
                  >
                    Agora não
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleInstallApp}
                    className="h-9 px-4 text-[8px] font-black uppercase tracking-widest bg-primary text-primary-foreground shadow-lg shadow-primary/20 rounded-xl"
                  >
                    Instalar
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Navigation Tabs */}
        <nav className="fixed bottom-0 left-0 right-0 h-16 glass-panel border-t border-white/5 flex items-center justify-center gap-2 lg:gap-12 z-[100] bg-background/80 backdrop-blur-3xl px-2 lg:px-8" aria-label="Navegação Global">
          <button
            onClick={() => { document.getElementById('workstation')?.scrollIntoView({ behavior: 'smooth' }); play("click"); }}
            className="text-[8px] lg:text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-1.5 lg:gap-2 px-3 lg:px-6 py-2 rounded-full text-foreground/60 hover:text-primary hover:bg-primary/5"
          >
            <Sparkles className="w-3 h-3" /> Workstation
          </button>
          <button
            onClick={() => { document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' }); play("click"); }}
            className="text-[8px] lg:text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-1.5 lg:gap-2 px-3 lg:px-6 py-2 rounded-full text-foreground/60 hover:text-secondary hover:bg-secondary/5"
          >
            <RefreshCw className="w-3 h-3" /> Galeria
          </button>
          <button
            onClick={() => { document.getElementById('mural')?.scrollIntoView({ behavior: 'smooth' }); play("click"); }}
            className="text-[8px] lg:text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-1.5 lg:gap-2 px-3 lg:px-6 py-2 rounded-full text-foreground/60 hover:text-accent hover:bg-accent/5"
          >
            <Share2 className="w-3 h-3" /> Mural
          </button>
        </nav>
      </div>
    </main>
  );
}




