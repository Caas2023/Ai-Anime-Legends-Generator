"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Download, RefreshCw, Sparkles, AlertCircle, Instagram, Facebook, MessageCircle, Share2, Github, Copy, Check } from "lucide-react";

import { CharacterSelector, CHARACTERS } from "@/components/character-selector";
import { ModelSelector, ART_STYLES } from "@/components/model-selector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { generateImage } from "@/actions/generate";
import { Gallery } from "@/components/gallery";
import { useGallery } from "@/hooks/use-gallery";
import { useSound } from "@/hooks/use-sound";
import { cn } from "@/lib/utils";

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
  const [error, setError] = React.useState<string | null>(null);
  const { play } = useSound();
  const { images, addImage, removeImage } = useGallery();

  const handleEnhance = async () => {
    if (!customPrompt.trim()) return;
    setIsEnhancing(true);
    play("click");

    try {
      // Small delay to simulate AI thinking
      await new Promise(resolve => setTimeout(resolve, 800));

      const enhanced = `${customPrompt}, ultra detailed, cinematic lighting, dramatic atmosphere, masterpiece, 8k resolution, highly intricate details`;
      setCustomPrompt(enhanced);
      play("success");
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);
    setGeneratedImage(null);
    setCurrentPrompt(null);

    const result = await generateImage(selectedCharacter, selectedStyle, customPrompt, selectedSize.width, selectedSize.height);

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

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    play("click");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `anime-legends-${selectedCharacter}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async (platform: 'whatsapp' | 'facebook' | 'general') => {
    if (!generatedImage) return;

    // For local data URLs, we usually can't share directly via link on social APIs
    // Best approach is Web Share API for mobile or instructions
    if (platform === 'general' && navigator.share) {
      try {
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const file = new File([blob], 'anime-art.jpg', { type: 'image/jpeg' });
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
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black text-white relative overflow-hidden font-sans">

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-[120px]" />
        <div className="absolute bottom-0 left-[20%] w-[60%] h-[30%] rounded-full bg-emerald-600/10 blur-[100px]" />
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-8 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3 md:space-y-4 mb-8 md:mb-12 pt-4 md:pt-8"
        >
          <div className="inline-flex items-center justify-center p-2 px-4 bg-white/5 rounded-full backdrop-blur-md border border-white/10 mb-2 md:mb-4 shadow-lg hover:bg-white/10 transition-colors">
            <Sparkles className="w-4 h-4 text-cyan-400 mr-2" />
            <span className="text-xs font-bold tracking-widest uppercase text-white/90">Anime Legends Generator</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40 drop-shadow-2xl">
            CRIE SUA LENDA
          </h1>
          <p className="text-base md:text-lg text-muted-foreground/80 max-w-2xl mx-auto font-medium px-4">
            Escolha seu personagem, defina o estilo e deixe a IA criar uma obra-prima.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">

          {/* Controls Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5 space-y-6 md:space-y-10"
          >
            {/* Character Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-cyan-600 text-white text-sm font-bold shadow-lg shadow-primary/25">1</div>
                  <h2 className="text-xl font-bold tracking-tight">Escolha a Lenda</h2>
                </div>
                <span className="text-xs font-medium text-white/40 uppercase tracking-widest">Pc / Mobile</span>
              </div>
              <CharacterSelector
                value={selectedCharacter}
                onChange={(val) => { setSelectedCharacter(val); play("click"); }}
                disabled={isGenerating}
              />
            </div>

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
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/25">4</div>
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

            {/* Generate Button */}
            <Button
              size="lg"
              className="w-full text-lg h-16 rounded-2xl bg-white text-black hover:bg-white/90 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] hover:scale-[1.02] active:scale-[0.98] font-bold tracking-wide relative overflow-hidden group"
              onClick={() => { handleGenerate(); play("click"); }}
              onMouseEnter={() => play("hover")}
              disabled={isGenerating}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:animate-shimmer" />
              {isGenerating ? (
                <div className="flex items-center">
                  <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                  CRIANDO ARTE...
                </div>
              ) : (
                <div className="flex items-center">
                  <Wand2 className="w-5 h-5 mr-3" />
                  GERAR OBRA-PRIMA
                </div>
              )}
            </Button>
          </motion.div>

          {/* Result Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-7 flex flex-col items-center"
          >
            <Card className="w-full aspect-[3/4] md:aspect-[4/5] bg-black/40 border-white/10 backdrop-blur-xl relative overflow-hidden rounded-3xl shadow-2xl group ring-1 ring-white/5">

              {/* Scanline Effect */}
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />

              {generatedImage ? (
                <div className="relative w-full h-full p-3 group">
                  <motion.div
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={generatedImage}
                      alt="Arte Gerada"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover rounded-2xl shadow-inner"
                      priority
                    />
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
              ) : isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-full max-w-[200px] aspect-square relative mb-8">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
                    <div className="absolute inset-4 rounded-full bg-primary/10 backdrop-blur-md flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-primary animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-400 animate-pulse">
                    Invocando Lenda...
                  </h3>
                  <p className="text-white/40 mt-4 text-sm tracking-widest uppercase">
                    A IA está desenhando cada detalhe
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
            <p className="mt-6 text-xs text-white/20 font-mono">
              POWERED BY POLLINATIONS.AI • FLUX MODEL
            </p>
          </motion.div>

          {/* Gallery Section */}
          <div className="col-span-1 lg:col-span-12 w-full">
            <Gallery images={images} onRemove={removeImage} onSelect={setGeneratedImage} />
          </div>

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
              Utilizando o modelo FLUX via Pollinations API. Todas as imagens são geradas por inteligência artificial.
              Respeite os termos de uso da plataforma.
            </p>
          </div>
        </footer>
      </div>
    </main >
  );
}
