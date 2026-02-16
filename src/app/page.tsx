"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Download, RefreshCw, Sparkles, AlertCircle } from "lucide-react";

import { CharacterSelector, CHARACTERS } from "@/components/character-selector";
import { ModelSelector, ART_STYLES } from "@/components/model-selector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { generateImage } from "@/actions/generate";
import { Gallery } from "@/components/gallery";
import { useGallery } from "@/hooks/use-gallery";
import { useSound } from "@/hooks/use-sound";

export default function Home() {
  const [selectedCharacter, setSelectedCharacter] = React.useState<string>("goku");
  const [selectedStyle, setSelectedStyle] = React.useState<string>("flux");
  const [customPrompt, setCustomPrompt] = React.useState<string>("");
  const [isEnhancing, setIsEnhancing] = React.useState(false);
  const [generatedImage, setGeneratedImage] = React.useState<string | null>(null);
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

    const result = await generateImage(selectedCharacter, selectedStyle, customPrompt);

    if (result.success && result.imageUrl) {
      setGeneratedImage(result.imageUrl);
      addImage(result.imageUrl, selectedCharacter, selectedStyle);
      play("success");
    } else {
      setError(result.error || "Algo deu errado");
      play("error");
    }

    setIsGenerating(false);
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-between p-8">
                    <div className="text-left">
                      <p className="text-white font-bold text-lg">{CHARACTERS.find(c => c.id === selectedCharacter)?.label}</p>
                      <p className="text-white/60 text-sm">{ART_STYLES.find(s => s.id === selectedStyle)?.label}</p>
                    </div>
                    <Button onClick={handleDownload} variant="secondary" className="shadow-lg font-bold">
                      <Download className="w-4 h-4 mr-2" />
                      Baixar HD
                    </Button>
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
      </div>
    </main >
  );
}
