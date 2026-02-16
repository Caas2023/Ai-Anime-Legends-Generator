"use server";

import { supabase } from "@/lib/supabase";

const MODEL = "flux";
const TIMEOUT_MS = 45000;
const API_KEY = process.env.POLLINATIONS_API_KEY;

const CHARACTERS: Record<string, string> = {
  goku: "Son Goku from Dragon Ball Z, Super Saiyan hair, orange martial arts gi, muscular build, intense gaze, anime masterpiece",
  naruto: "Naruto Uzumaki from Naruto Shippuden, blonde spiky hair, whisker marks on face, orange and black ninja outfit, headband, energetic expression",
  luffy: "Monkey D. Luffy from One Piece, straw hat, red vest, scar under eye, big smile, pirate king vibe",
  sailormoon: "Sailor Moon (Usagi Tsukino), magical girl outfit, long blonde twin tails, tiara, moon background, sparkly transformation",
  ichigo: "Kurosaki Ichigo from Bleach, orange hair, black shihakusho kimono, giant sword Zangetsu, hollow mask fragment",
  zoro: "Roronoa Zoro from One Piece, green hair, three swords style, green haramaki, scarred eye, serious samurai expression",
  nezuko: "Nezuko Kamado from Demon Slayer, bamboo muzzle, long black hair with orange tips, pink kimono, cute demon eyes",
  gojo: "Satoru Gojo from Jujutsu Kaisen, white hair, blindfold (or stunning blue eyes), black high collar uniform, infinity void domain background",
  makima: "Makima from Chainsaw Man, pink-red hair, hypnotic yellow ringed eyes, business suit, mysterious and controlling aura",
  vegeta: "Vegeta from Dragon Ball, Saiyan battle armor, spiky vertical hair, arms crossed, prideful smirk, blue energy aura",
};

const STYLES: Record<string, string> = {
  flux: "high quality anime art, detailed shading, vibrant colors, 8k resolution, cinematic composition",
  realistic: "realistic cosplay photo, live action movie adoption, detailed skin texture, cinematic lighting, 85mm lens, photorealistic",
  "3d": "3d render, pixar style, disney animation, unreal engine 5, cgi character, smooth lighting, subsurface scattering",
  retro: "90s anime aesthetic, retro cel animation, vhs glitch effect, grainy texture, muted colors, sailor moon art style",
  manga: "manga page, black and white, ink lines, detailed hatching, screen tones, comic book style, dramatic impact",
  cyberpunk: "cyberpunk aesthetic, neon lights, futuristic city background, chrome details, hologram effects, synthwave color palette",
  watercolor: "watercolor painting, soft brush strokes, pastel colors, artistic, dreamy atmosphere, paper texture",
  dark: "dark fantasy, gothic horror, heavy shadows, berserk art style, dramatic contrast, grim atmosphere",
};

/**
 * Gera um prompt dinâmico e único usando IA de texto (com timeout de 8s)
 */
async function getDynamicPrompt(characterLabel: string, styleLabel: string, customDetails: string): Promise<string | null> {
  const systemPrompt = "You are a creative art director. Create a UNIQUE, detailed image prompt for an AI image generator. Vary the pose, mood, lighting, and background scene each time. Focus on anime aesthetics. Output ONLY the prompt text in English, nothing else.";
  const userRequest = `Character: ${characterLabel}. Art Style: ${styleLabel}. Extra details: ${customDetails || 'Create a random epic scene'}.`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userRequest }
        ],
        model: "openai",
        seed: Math.floor(Math.random() * 1000000)
      })
    });

    clearTimeout(timeout);

    if (response.ok) {
      const text = await response.text();
      const cleaned = text.trim();
      if (cleaned.length > 10) {
        console.log("[DYNAMIC PROMPT] OK:", cleaned.substring(0, 80) + "...");
        return cleaned;
      }
    }
  } catch (error) {
    console.warn("[DYNAMIC PROMPT] Timeout ou erro, usando fallback.");
  }
  return null;
}

export async function generateImage(characterId: string, styleId: string, customPrompt?: string, width: number = 768, height: number = 1024) {
  try {
    const characterLabel = CHARACTERS[characterId] || characterId;
    const styleLabel = STYLES[styleId] || styleId;

    console.log(`[GEN] Início: ${characterId} | ${styleId}`);

    // 1. Tenta prompt dinâmico (máx 8s)
    let finalPrompt = await getDynamicPrompt(characterLabel, styleLabel, customPrompt || "");

    // 2. Fallback: template fixo
    if (!finalPrompt) {
      console.log("[GEN] Usando prompt fixo (fallback)");
      finalPrompt = `masterpiece, best quality, anime style, ${characterLabel}, ${styleLabel}, ${customPrompt || ''}, detailed background, cinematic lighting, looking at viewer`;
    }

    // 3. Gera a imagem
    const encodedPrompt = encodeURIComponent(finalPrompt);
    const seed = Math.floor(Math.random() * 1000000);
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=${MODEL}&seed=${seed}&width=${width}&height=${height}&nologo=true`;

    console.log(`[GEN] Chamando API de imagem... (timeout: ${TIMEOUT_MS}ms)`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const fetchOptions: RequestInit = {
      method: "GET",
      signal: controller.signal,
    };

    if (API_KEY) {
      fetchOptions.headers = { "Authorization": `Bearer ${API_KEY}` };
    }

    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    console.log(`[GEN] Resposta: ${response.status} | Content-Type: ${response.headers.get("content-type")}`);

    if (!response.ok) {
      return { success: false, error: `Erro na API (${response.status}). Tente novamente.` };
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("image")) {
      return { success: false, error: "A IA não retornou uma imagem. Tente outro estilo." };
    }

    // 4. Converte para base64
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const mimeType = contentType.includes("png") ? "image/png" : "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    console.log(`[GEN] Imagem recebida: ${buffer.length} bytes`);

    // 5. Tenta salvar no Supabase (NÃO bloqueia a resposta)
    if (supabase) {
      try {
        const fileName = `${characterId}-${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(fileName, buffer, { contentType: 'image/jpeg' });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(fileName);
          await supabase.from('generations').insert({
            image_url: publicUrl,
            character_id: characterId,
            style_id: styleId,
            prompt: finalPrompt
          });
          console.log("[GEN] Salvo no Supabase:", publicUrl);
          return { success: true, imageUrl: publicUrl, prompt: finalPrompt };
        } else {
          console.warn("[SUPABASE] Upload falhou:", uploadError.message);
        }
      } catch (e) {
        console.warn("[SUPABASE] Erro ignorado:", e);
      }
    }

    // 6. Retorna imagem em base64 (fallback sem Supabase)
    console.log("[GEN] Retornando via base64 (sem Supabase)");
    return { success: true, imageUrl: dataUrl, prompt: finalPrompt };

  } catch (error: any) {
    console.error("[GEN FATAL]", error?.message || error);

    if (error?.name === "AbortError") {
      return { success: false, error: "A geração demorou demais (45s). Tente um tamanho menor." };
    }

    return { success: false, error: "Falha na conexão com a IA. Verifique sua internet." };
  }
}
