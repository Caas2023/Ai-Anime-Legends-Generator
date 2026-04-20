"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Download, RefreshCw, Sparkles, AlertCircle, Instagram, Facebook, MessageCircle, Share2, Github, Copy, Check, Video, Play, Settings, ChevronDown } from "lucide-react";

import { CharacterSelector } from "@/components/character-selector";
import { ModelSelector } from "@/components/model-selector";
import { CHARACTERS, ART_STYLES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { generateImage, composePrompt } from "@/actions/generate";
import { Gallery } from "@/components/gallery";
import { useGallery } from "@/hooks/use-gallery";
import { useSound } from "@/hooks/use-sound";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { CommunityFeed } from "@/components/community-feed";

const IMAGE_SIZES = [
  { id: "portrait", label: "Retrato (3:4)", width: 768, height: 1024, icon: "📱" },
  { id: "square", label: "Quadrado (1:1)", width: 1024, height: 1024, icon: "🟦" },
  { id: "landscape", label: "Paisagem (4:3)", width: 1024, height: 768, icon: "🖼️" },
  { id: "story", label: "Story (9:16)", width: 576, height: 1024, icon: "🤳" },
  { id: "wide", label: "Wide (16:9)", width: 1024, height: 576, icon: "📺" },
];

export default function Home() {
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

  React.useEffect(() => {
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

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

      const res = await fetch("https://gen.pollinations.ai/v1/chat/completions", {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: "openai",
          messages: [
            { role: "system", content: "Você é um especialista em prompts para IA de imagem. Receba um prompt curto e retorne uma versão melhorada, mais detalhada e criativa, em inglês. Retorne APENAS o texto do prompt melhorado sem explicações." },
            { role: "user", content: customPrompt }
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
    <main className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 relative overflow-hidden font-sans pb-16">
      
      {/* Background Animado Dinâmico (Orbes UI) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Mesh Background */}
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
        
        {/* Orbes Animados com Framer/Tailwind */}
        <div className="absolute -top-[10%] -left-[10%] w-[45%] h-[45%] rounded-full bg-purple-600/20 blur-[150px] animate-pulse mix-blend-screen" style={{ animationDuration: '7s' }} />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-cyan-600/15 blur-[160px] animate-pulse mix-blend-screen" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] rounded-full bg-emerald-600/10 blur-[140px] animate-pulse mix-blend-screen" style={{ animationDuration: '8s', animationDelay: '1s' }} />
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-8 relative z-10">

        {/* Global Nav / BYOP */}
        <div className="absolute top-4 right-4 z-50 flex items-center">
          {apiKey ? (
            <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl border border-white/10 p-1.5 pl-4 rounded-full shadow-2xl">
              <span className="text-xs font-bold text-emerald-400 flex items-center">
                <Check className="w-3 h-3 mr-1" />
                <span className="hidden md:inline">Pollen Ativo</span>
              </span>
              <Button size="sm" variant="ghost" onClick={handleLogout} className="h-8 rounded-full text-xs hover:bg-white/10 text-white/70">Sair</Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={handleLogin} className="h-10 rounded-full border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 backdrop-blur-md shadow-lg shadow-primary/20 gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden md:inline font-bold">Zere os Custos (BYOP)</span>
              <span className="md:hidden font-bold">BYOP</span>
            </Button>
          )}
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3 md:space-y-4 mb-8 md:mb-12 pt-4 md:pt-8"
        >
          <div className="inline-flex items-center justify-center p-2 px-4 bg-white/5 rounded-full backdrop-blur-md border border-white/10 mb-2 md:mb-4 shadow-lg hover:bg-white/10 transition-colors">
            <Image src="/logo.png" alt="Logo" width={24} height={24} className="rounded-full mr-2 shadow-cyan-500/50 shadow-sm" />
            <span className="text-xs font-bold tracking-widest uppercase text-white/90">Anime Legends</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            Ai Anime Legends Generator
          </h1>
          <p className="text-base md:text-lg text-muted-foreground/80 max-w-2xl mx-auto font-medium px-4">
            Escolha seu personagem, defina o estilo e deixe a IA criar uma obra-prima.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start w-full">
          
          {/* Lendas Sidebar (Esquerda) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 flex flex-col lg:sticky lg:top-8"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-cyan-600 text-white text-sm font-bold shadow-lg shadow-primary/25">1</div>
              <h2 className="text-xl font-bold tracking-tight">O Herói</h2>
            </div>
            {/* O Componente agora é vertical no PC */}
            <CharacterSelector
              value={selectedCharacter}
              onChange={(val) => { setSelectedCharacter(val); play("click"); }}
              disabled={isGenerating || isGeneratingVideo}
            />
          </motion.div>

          {/* Controls Section (Meio) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5 space-y-6 md:space-y-10"
          >
            {/* Model/Style Selection */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 text-white text-sm font-bold shadow-lg shadow-blue-500/25">2</div>
                <h2 className="text-xl font-bold tracking-tight">Estilo Artístico</h2>
              </div>
              <ModelSelector
                value={selectedStyle}
                onChange={(val) => { setSelectedStyle(val); play("click"); }}
                disabled={isGenerating}
              />
            </div>

            {/* Size Selection */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-purple-500/25">3</div>
                <h2 className="text-xl font-bold tracking-tight">Tamanho da Imagem</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {IMAGE_SIZES.map((size) => (
                  <Button
                    key={size.id}
                    variant={selectedSize.id === size.id ? "default" : "outline"}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 h-auto rounded-xl border-white/10 transition-all gap-2",
                      selectedSize.id === size.id ? "bg-white text-black scale-105" : "bg-white/5 text-white/60 hover:bg-white/10"
                    )}
                    onClick={() => { setSelectedSize(size); play("click"); }}
                    disabled={isGenerating}
                  >
                    <span className="text-2xl">{size.icon}</span>
                    <span className="text-[10px] uppercase tracking-tighter font-bold">{size.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Prompt Context */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/25">3</div>
                <h2 className="text-xl font-bold tracking-tight">Detalhes Extras</h2>
              </div>
              <div className="relative group">
                <Input
                  placeholder="Ex: segurando uma espada de fogo, no topo de uma montanha..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  disabled={isGenerating || isEnhancing}
                  className="bg-white/5 border-white/10 h-14 rounded-xl placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20 transition-all text-white pr-32"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-10 px-3 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-xs font-bold transition-all"
                    onClick={handleEnhance}
                    disabled={isGenerating || isEnhancing || !customPrompt.trim()}
                  >
                    {isEnhancing ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 mr-1.5" />
                        MELHORAR
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold ml-1">
                Adicione elementos personalizados à sua criação
              </p>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center text-red-200 text-sm bg-red-500/10 border border-red-500/20 p-4 rounded-xl"
                >
                  <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Generate Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                size="lg"
                className="w-full text-base md:text-sm lg:text-base h-16 rounded-2xl bg-white text-black hover:bg-white/90 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] active:scale-[0.98] font-bold tracking-wide relative overflow-hidden group"
                onClick={() => { handleGenerate(); play("click"); }}
                onMouseEnter={() => play("hover")}
                disabled={isGenerating || isGeneratingVideo}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:animate-shimmer" />
                {isGenerating ? (
                  <div className="flex items-center">
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    CRIANDO...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Wand2 className="w-4 h-4 mr-2" />
                    GERAR FOTO
                  </div>
                )}
              </Button>

              <Button
                size="lg"
                className={cn(
                  "w-full text-base md:text-sm lg:text-base h-16 rounded-2xl transition-all active:scale-[0.98] font-bold tracking-wide relative overflow-hidden group border",
                  apiKey 
                    ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 border-transparent shadow-[0_0_30px_-10px_rgba(168,85,247,0.5)]" 
                    : "bg-white/5 text-white/30 border-white/10 cursor-not-allowed"
                )}
                onClick={() => { if(apiKey) { handleGenerateVideo(); } }}
                onMouseEnter={() => { if(apiKey) play("hover"); }}
                disabled={isGenerating || isGeneratingVideo || !apiKey}
                title={!apiKey ? "Requer conexão Pollen (BYOP) no topo da página" : "Gerar animação de vídeo exclusiva"}
              >
                {!apiKey && <div className="absolute inset-0 bg-black/60 z-10 flex flex-col items-center justify-center text-[10px] uppercase tracking-widest text-white/60"><span className="text-white/40 mb-1">Bloqueado</span><span>Conecte Pollen</span></div>}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-shimmer" />
                {isGeneratingVideo ? (
                  <div className="flex items-center relative z-0">
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ANIMANDO...
                  </div>
                ) : (
                  <div className="flex items-center relative z-0">
                    <Video className="w-4 h-4 mr-2" />
                    GERAR VÍDEO
                  </div>
                )}
              </Button>
            </div>
          </motion.div>

          {/* Result Section (Direita) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-5 flex flex-col items-center lg:sticky lg:top-8"
          >
            <Card className="w-full aspect-[3/4] md:aspect-[4/5] bg-black/40 border-white/10 backdrop-blur-xl relative overflow-hidden rounded-3xl shadow-2xl group ring-1 ring-white/5">

              {/* Scanline Effect */}
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />

              {generatedImage || generatedVideo ? (
                <div className="relative w-full h-full p-3 group">
                  <motion.div
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-full h-full"
                  >
                    {generatedVideo ? (
                      <video
                        src={generatedVideo}
                        controls
                        autoPlay
                        loop
                        playsInline
                        className="object-cover w-full h-full rounded-2xl shadow-inner bg-black"
                      />
                    ) : (
                      <Image
                        src={generatedImage!}
                        alt="Arte Gerada"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover rounded-2xl shadow-inner"
                        priority
                      />
                    )}
                  </motion.div>

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6 md:p-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="text-left">
                        <p className="text-white font-black text-2xl uppercase tracking-tighter">
                          {CHARACTERS.find(c => c.id === selectedCharacter)?.label}
                        </p>
                        <p className="text-cyan-400/80 text-sm font-bold uppercase tracking-widest flex items-center">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {ART_STYLES.find(s => s.id === selectedStyle)?.label}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {/* Download Button */}
                        <Button
                          onClick={handleDownload}
                          variant="gradient"
                          className="shadow-xl font-bold h-12 px-6"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          BAIXAR HD
                        </Button>

                        {/* Social Buttons */}
                        <div className="flex items-center bg-white/10 backdrop-blur-md rounded-xl p-1 border border-white/10">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-10 w-10 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                            onClick={() => handleShare('whatsapp')}
                            title="Compartilhar no WhatsApp"
                          >
                            <MessageCircle className="w-5 h-5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-10 w-10 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                            onClick={() => handleShare('facebook')}
                            title="Compartilhar no Facebook"
                          >
                            <Facebook className="w-5 h-5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-10 w-10 text-pink-400 hover:text-pink-300 hover:bg-pink-500/10"
                            onClick={() => handleShare('general')}
                            title="Compartilhar no Instagram/Outros"
                          >
                            <Instagram className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : isGenerating || isGeneratingVideo ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-full max-w-[200px] aspect-square relative mb-8">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
                    <div className="absolute inset-4 rounded-full bg-primary/10 backdrop-blur-md flex items-center justify-center">
                      {isGeneratingVideo ? <Video className="w-12 h-12 text-purple-400 animate-pulse" /> : <Sparkles className="w-12 h-12 text-primary animate-pulse" />}
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-400 animate-pulse">
                    {isGeneratingVideo ? "Animando a Lenda..." : "Invocando Lenda..."}
                  </h3>
                  <p className="text-white/40 mt-4 text-sm tracking-widest uppercase">
                    {isGeneratingVideo ? "Gerando quadros do vídeo, pode levar alguns segundos" : "A IA está desenhando cada detalhe"}
                  </p>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-6">
                  <div className="w-32 h-32 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 transform rotate-3 group-hover:rotate-6 transition-transform duration-500">
                    <Sparkles className="w-12 h-12 text-white/20 group-hover:text-white/40 transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Tela em Branco</h3>
                    <p className="text-white/40 max-w-xs mx-auto">
                      Selecione um personagem e um estilo para começar a mágica.
                    </p>
                  </div>
                </div>
              )}
            </Card>

            {currentPrompt && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md relative group max-w-2xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center">
                    <Sparkles className="w-3 h-3 mr-2 text-cyan-400" />
                    Prompt da IA
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-3 text-[10px] font-bold bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all"
                    onClick={() => handleCopyPrompt(currentPrompt)}
                  >
                    {copied ? (
                      <><Check className="w-3 h-3 mr-1.5 text-emerald-400" /> COPIADO</>
                    ) : (
                      <><Copy className="w-3 h-3 mr-1.5" /> COPIAR PROMPT</>
                    )}
                  </Button>
                </div>
                <div className="max-h-24 overflow-y-auto pr-2 custom-scrollbar">
                  <p className="text-xs text-white/60 font-medium leading-relaxed italic">
                    "{currentPrompt}"
                  </p>
                </div>
              </motion.div>
            )}

            {/* Footer Note */}
            <p className="mt-8 text-[10px] uppercase font-bold tracking-widest text-white/10">
              Ai Anime Legends Generator • Powered by Pollinations
            </p>
          </motion.div>

          {/* Gallery Section */}
          <div className="col-span-1 lg:col-span-12 w-full">
            <Gallery images={images} onRemove={removeImage} onSelect={(url) => {
              setGeneratedImage(url);
              const item = images.find(img => img.url === url);
              if (item?.prompt) setCurrentPrompt(item.prompt);
            }} />
          </div>

          {/* Mural da Comunidade (Seção Pública Global) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="col-span-1 lg:col-span-12 mt-12 mb-20"
          >
            <div className="flex flex-col items-center gap-4 mb-12">
              <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <div className="space-y-2">
                <h2 className="text-4xl md:text-6xl font-black text-center tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/30">
                  Mural das Lendas
                </h2>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em]">Criações Globais da Comunidade Live</p>
                </div>
              </div>
            </div>
            
            <CommunityFeed />
          </motion.div>

        </div>

        {/* Footer with Credits */}
        <footer className="mt-20 py-10 border-t border-white/5 text-center space-y-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <a
              href="https://pollinations.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="group transition-all hover:scale-105"
            >
              <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl shadow-2xl group-hover:border-primary/50 group-hover:bg-white/10 transition-all">
                <span className="text-white/40 font-bold text-[10px] tracking-[0.2em] uppercase">Built with</span>
                <div className="h-6 w-px bg-white/10" />
                <img
                  src="https://pollinations.ai/logo_text_white.png"
                  alt="Pollinations.ai Logo"
                  className="h-5 opacity-80 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </a>

            <div className="flex items-center space-x-6">
              <p className="text-white/20 text-[10px] font-bold tracking-[0.3em] uppercase">
                © {new Date().getFullYear()} ANIME LEGENDS • AI ART GENERATOR
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <a href="https://github.com/Caas2023/anime-transformer" target="_blank" className="text-white/20 hover:text-white/60 transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="max-w-md mx-auto">
            <p className="text-white/10 text-[9px] leading-relaxed uppercase tracking-tighter">
              Utilizando Imagen-4 + GPT-4o via Pollinations API. Todas as imagens são geradas por inteligência artificial.
              Respeite os termos de uso da plataforma.
            </p>
          </div>
        </footer>
      </div>
    </main >
  );
}
