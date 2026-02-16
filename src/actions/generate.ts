"use server";

import { supabase } from "@/lib/supabase";

const MODEL = "flux";
const TIMEOUT_MS = 45000;
const MAX_PROMPT_LENGTH = 500;
const API_KEY = process.env.POLLINATIONS_API_KEY;

const CHARACTERS: Record<string, string> = {
  goku: "Son Goku from Dragon Ball Z, Super Saiyan hair, orange martial arts gi, muscular build, intense gaze",
  naruto: "Naruto Uzumaki from Naruto Shippuden, blonde spiky hair, whisker marks, orange ninja outfit, headband",
  luffy: "Monkey D. Luffy from One Piece, straw hat, red vest, scar under eye, big smile",
  sailormoon: "Sailor Moon Usagi Tsukino, magical girl outfit, blonde twin tails, tiara, sparkly",
  ichigo: "Kurosaki Ichigo from Bleach, orange hair, black kimono, giant sword Zangetsu",
  zoro: "Roronoa Zoro from One Piece, green hair, three swords, scarred eye, serious expression",
  nezuko: "Nezuko Kamado from Demon Slayer, bamboo muzzle, black hair orange tips, pink kimono",
  gojo: "Satoru Gojo from Jujutsu Kaisen, white hair, blue eyes, black uniform",
  makima: "Makima from Chainsaw Man, pink-red hair, yellow ringed eyes, business suit",
  vegeta: "Vegeta from Dragon Ball, Saiyan armor, spiky hair, arms crossed, blue aura",
};

const STYLES: Record<string, string> = {
  flux: "high quality anime art, vibrant colors, 4k, cinematic",
  realistic: "realistic cosplay photo, cinematic lighting, photorealistic",
  "3d": "3d render, pixar style, unreal engine 5, smooth lighting",
  retro: "90s anime aesthetic, retro cel animation, muted colors",
  manga: "manga page, black and white, ink lines, screen tones",
  cyberpunk: "cyberpunk aesthetic, neon lights, futuristic city, synthwave",
  watercolor: "watercolor painting, soft brush strokes, pastel colors",
  dark: "dark fantasy, gothic horror, heavy shadows, dramatic contrast",
};

/**
 * Gera um prompt dinâmico via IA de texto (timeout 8s)
 */
async function getDynamicPrompt(characterLabel: string, styleLabel: string, customDetails: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are an anime art director. Create a SHORT (max 80 words) unique image prompt. Vary pose, mood, lighting, scene. Output ONLY the English prompt text." },
          { role: "user", content: `Character: ${characterLabel}. Style: ${styleLabel}. Extra: ${customDetails || 'epic random scene'}.` }
        ],
        model: "openai",
        seed: Math.floor(Math.random() * 999999)
      })
    });

    clearTimeout(timeout);

    if (response.ok) {
      const text = (await response.text()).trim();
      if (text.length > 20 && text.length < MAX_PROMPT_LENGTH) {
        return text;
      }
      if (text.length >= MAX_PROMPT_LENGTH) {
        return text.substring(0, MAX_PROMPT_LENGTH);
      }
    }
  } catch {
    console.warn("[PROMPT] IA de texto indisponível, usando fallback.");
  }
  return null;
}

/**
 * Tenta gerar uma imagem com retry automático
 */
async function fetchImage(prompt: string, width: number, height: number): Promise<Response | null> {
  const truncatedPrompt = prompt.length > MAX_PROMPT_LENGTH ? prompt.substring(0, MAX_PROMPT_LENGTH) : prompt;
  const encodedPrompt = encodeURIComponent(truncatedPrompt);
  const seed = Math.floor(Math.random() * 999999);

  // Tenta 2 endpoints diferentes
  const urls = [
    `https://image.pollinations.ai/prompt/${encodedPrompt}?model=${MODEL}&seed=${seed}&width=${width}&height=${height}&nologo=true`,
    `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}&width=${width}&height=${height}&nologo=true`,
  ];

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const headers: Record<string, string> = {};
      if (API_KEY) headers["Authorization"] = `Bearer ${API_KEY}`;

      const response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        headers,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const ct = response.headers.get("content-type") || "";
        if (ct.includes("image")) {
          return response;
        }
      }

      console.warn(`[FETCH] Tentativa falhou: ${response.status} para ${url.substring(0, 80)}...`);
    } catch (e: any) {
      console.warn(`[FETCH] Erro: ${e?.name || e}`);
    }
  }

  return null;
}

export async function generateImage(characterId: string, styleId: string, customPrompt?: string, width: number = 768, height: number = 1024) {
  try {
    const characterLabel = CHARACTERS[characterId] || characterId;
    const styleLabel = STYLES[styleId] || styleId;

    console.log(`[GEN] Início: ${characterId} | ${styleId}`);

    // 1. Prompt dinâmico
    let finalPrompt = await getDynamicPrompt(characterLabel, styleLabel, customPrompt || "");

    // 2. Fallback fixo
    if (!finalPrompt) {
      finalPrompt = `anime masterpiece, ${characterLabel}, ${styleLabel}, ${customPrompt || ''}, detailed face, cinematic`;
    }

    // 3. Tenta gerar imagem (com retry)
    let response = await fetchImage(finalPrompt, width, height);

    // 4. Se falhou, tenta com prompt simples (sem IA de texto)
    if (!response) {
      console.log("[GEN] Retry com prompt simples...");
      const simplePrompt = `anime art, ${CHARACTERS[characterId] || 'anime character'}, ${STYLES[styleId] || 'high quality'}, detailed`;
      response = await fetchImage(simplePrompt, width, height);
      if (response) finalPrompt = simplePrompt;
    }

    // 5. Se ainda falhou, erro final
    if (!response) {
      return { success: false, error: "Servidor de IA indisponível. Aguarde 1 min e tente novamente." };
    }

    // 6. Processa imagem
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const dataUrl = `data:${contentType};base64,${base64}`;

    console.log(`[GEN] OK: ${buffer.length} bytes`);

    // 7. Supabase (opcional, não bloqueia)
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
          return { success: true, imageUrl: publicUrl, prompt: finalPrompt };
        }
      } catch {
        // Supabase falhou, continua com base64
      }
    }

    return { success: true, imageUrl: dataUrl, prompt: finalPrompt };

  } catch (error: any) {
    console.error("[GEN FATAL]", error?.message || error);

    if (error?.name === "AbortError") {
      return { success: false, error: "Timeout: a geração demorou demais. Tente tamanho menor." };
    }

    return { success: false, error: "Falha na conexão. Verifique sua internet e tente novamente." };
  }
}
