"use server";

import { supabase } from "@/lib/supabase";

// === CONFIGURAÇÃO (baseado na doc oficial gen.pollinations.ai) ===
const POLLINATIONS_MODEL = "flux"; // modelos: flux, turbo, gptimage, zimage, seedream, nanobanana
const TIMEOUT_MS = 45000;
const MAX_PROMPT_LENGTH = 500;
const POLLINATIONS_KEY = process.env.POLLINATIONS_API_KEY;
const AIRFORCE_KEY = process.env.AIRFORCE_API_KEY;
const AIRFORCE_COOLDOWN_MS = 61000;

let lastAirforceCall = 0;

// === PERSONAGENS ===
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

// === ESTILOS ===
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

// === IA DE TEXTO (endpoint oficial: /v1/chat/completions) ===
async function getDynamicPrompt(characterLabel: string, styleLabel: string, customDetails: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    // Usa o endpoint correto da API com autenticação
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    let url = "https://gen.pollinations.ai/v1/chat/completions";

    if (POLLINATIONS_KEY) {
      headers["Authorization"] = `Bearer ${POLLINATIONS_KEY}`;
    } else {
      // Sem chave, usa o endpoint simples de texto (anônimo)
      url = "https://gen.pollinations.ai/v1/chat/completions";
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        model: "openai",
        messages: [
          {
            role: "system", content: `You are a creative anime art director who interprets user requests intelligently.

RULES:
1. The user selects a BASE character and a visual STYLE.
2. The user may also provide EXTRA instructions — these are the MOST IMPORTANT part.
3. The EXTRA field can modify, combine, or completely transform the base character. Examples:
   - Base: "Naruto" + Extra: "but as Goku" → Create Naruto wearing Goku's outfit, doing a Kamehameha
   - Base: "Goku" + Extra: "fighting Vegeta" → Create an epic battle scene between both
   - Base: "Sailor Moon" + Extra: "cyberpunk version" → Reimagine Sailor Moon in a cyberpunk world
   - Base: "Luffy" + Extra: "realistic photo" → Override style to make a realistic photo of Luffy
4. If no EXTRA is given, create a unique and epic random scene.
5. Output ONLY the English image prompt (max 60 words). No explanations, no warnings, no notes.
6. Always vary pose, mood, lighting, background, and atmosphere.` },
          { role: "user", content: `BASE CHARACTER: ${characterLabel}\nVISUAL STYLE: ${styleLabel}\nEXTRA INSTRUCTIONS: ${customDetails || 'Create a unique epic random scene with this character'}` }
        ],
        seed: Math.floor(Math.random() * 999999)
      })
    });

    clearTimeout(timeout);

    if (response.ok) {
      const json = await response.json();
      let text = json?.choices?.[0]?.message?.content?.trim() || "";

      // Limpa qualquer lixo
      text = sanitizePrompt(text);

      if (text.length > MAX_PROMPT_LENGTH) text = text.substring(0, MAX_PROMPT_LENGTH);
      if (text.length > 20) {
        console.log("[PROMPT] Dinâmico OK:", text.substring(0, 80) + "...");
        return text;
      }
    }
  } catch {
    console.warn("[PROMPT] IA de texto indisponível, usando fallback.");
  }
  return null;
}

/**
 * Limpa o prompt removendo avisos, notas e lixo injetado pela API
 */
function sanitizePrompt(text: string): string {
  const warningPatterns = [
    /⚠️[^]*?(?=\n\n|$)/gi,
    /\*\*IMPORTANT[^]*?(?=\n\n|$)/gi,
    /Note:.*(?:deprecated|migrate|pollinations|api|service).*$/gim,
    /Please migrate.*$/gim,
    /The Pollinations.*$/gim,
    /Anonymous requests.*$/gim,
    /https?:\/\/\S+pollinations\S*/gi,
    /https?:\/\/enter\.pollinations\.\S*/gi,
  ];

  let cleaned = text;
  for (const pattern of warningPatterns) {
    cleaned = cleaned.replace(pattern, "");
  }

  cleaned = cleaned.replace(/\n{3,}/g, "\n").trim();

  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  return cleaned;
}

// === API PRINCIPAL: POLLINATIONS (endpoint oficial: /image/{prompt}) ===
async function fetchFromPollinations(prompt: string, width: number, height: number): Promise<{ buffer: Buffer; contentType: string } | null> {
  const truncated = prompt.substring(0, MAX_PROMPT_LENGTH);
  const encoded = encodeURIComponent(truncated);
  const seed = Math.floor(Math.random() * 999999);

  // URL oficial: https://gen.pollinations.ai/image/{prompt}
  const url = `https://gen.pollinations.ai/image/${encoded}?model=${POLLINATIONS_MODEL}&seed=${seed}&width=${width}&height=${height}&nologo=true`;

  console.log(`[POLLINATIONS] Chamando: model=${POLLINATIONS_MODEL}, seed=${seed}, ${width}x${height}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const headers: Record<string, string> = {};
    if (POLLINATIONS_KEY) {
      headers["Authorization"] = `Bearer ${POLLINATIONS_KEY}`;
    }

    const response = await fetch(url, { method: "GET", signal: controller.signal, headers });
    clearTimeout(timeoutId);

    console.log(`[POLLINATIONS] Resposta: ${response.status} | CT: ${response.headers.get("content-type")}`);

    if (response.ok) {
      const ct = response.headers.get("content-type") || "";
      if (ct.includes("image")) {
        const arrayBuffer = await response.arrayBuffer();
        return { buffer: Buffer.from(arrayBuffer), contentType: ct };
      }
    }

    console.warn(`[POLLINATIONS] Falhou: ${response.status}`);
  } catch (e: any) {
    console.warn(`[POLLINATIONS] Erro: ${e?.name || e}`);
  }
  return null;
}

// === API RESERVA: AIRFORCE (rate limit: 61s) ===
async function fetchFromAirforce(prompt: string, width: number, height: number): Promise<{ buffer: Buffer; contentType: string } | null> {
  if (!AIRFORCE_KEY) {
    console.warn("[AIRFORCE] Chave não configurada.");
    return null;
  }

  const now = Date.now();
  const timeSinceLastCall = now - lastAirforceCall;
  if (timeSinceLastCall < AIRFORCE_COOLDOWN_MS) {
    const waitTime = Math.ceil((AIRFORCE_COOLDOWN_MS - timeSinceLastCall) / 1000);
    console.warn(`[AIRFORCE] Rate limit: aguardar mais ${waitTime}s.`);
    return null;
  }

  let size = "1024x1024";
  if (width > height) size = "1024x768";
  else if (height > width) size = "768x1024";

  console.log(`[AIRFORCE] Tentando com plutogen-o1, size=${size}...`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch("https://api.airforce/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${AIRFORCE_KEY}`,
        "Content-Type": "application/json"
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "plutogen-o1",
        prompt: prompt.substring(0, MAX_PROMPT_LENGTH),
        n: 1,
        size: size,
        response_format: "url",
        sse: true
      })
    });

    clearTimeout(timeoutId);
    lastAirforceCall = Date.now();

    if (!response.ok) {
      console.warn(`[AIRFORCE] API retornou: ${response.status}`);
      return null;
    }

    // Processa SSE response
    const text = await response.text();
    let imageUrl: string | null = null;

    for (const line of text.split("\n")) {
      if (line.startsWith("data: ") && line !== "data: [DONE]" && !line.includes("keepalive")) {
        try {
          const data = JSON.parse(line.substring(6));
          if (data?.data?.[0]?.url) { imageUrl = data.data[0].url; break; }
          if (data?.url) { imageUrl = data.url; break; }
        } catch { /* SSE line inválida */ }
      }
    }

    if (!imageUrl) {
      try {
        const json = JSON.parse(text);
        imageUrl = json?.data?.[0]?.url || json?.url || null;
      } catch {
        console.warn("[AIRFORCE] Formato de resposta não reconhecido.");
      }
    }

    if (imageUrl) {
      console.log(`[AIRFORCE] Imagem gerada! Baixando...`);
      const imgResponse = await fetch(imageUrl);
      if (imgResponse.ok) {
        const ct = imgResponse.headers.get("content-type") || "image/png";
        const arrayBuffer = await imgResponse.arrayBuffer();
        return { buffer: Buffer.from(arrayBuffer), contentType: ct };
      }
    }

    console.warn("[AIRFORCE] Nenhuma URL de imagem encontrada.");
  } catch (e: any) {
    console.warn(`[AIRFORCE] Erro: ${e?.message || e}`);
    lastAirforceCall = Date.now();
  }
  return null;
}

// === FUNÇÃO PRINCIPAL ===
export async function generateImage(characterId: string, styleId: string, customPrompt?: string, width: number = 768, height: number = 1024) {
  try {
    const characterLabel = CHARACTERS[characterId] || characterId;
    const styleLabel = STYLES[styleId] || styleId;

    console.log(`\n[GEN] ========================================`);
    console.log(`[GEN] ${characterId} | ${styleId} | ${new Date().toISOString()}`);

    // 1. Prompt dinâmico via IA de texto
    let finalPrompt = await getDynamicPrompt(characterLabel, styleLabel, customPrompt || "");

    // 2. Fallback: prompt fixo
    if (!finalPrompt) {
      finalPrompt = `anime masterpiece, ${characterLabel}, ${styleLabel}, ${customPrompt || ''}, detailed face, cinematic`;
    }

    console.log(`[GEN] Prompt: ${finalPrompt.substring(0, 100)}...`);

    // 3. Tenta POLLINATIONS primeiro
    console.log("[GEN] >>> Tentando Pollinations...");
    let result = await fetchFromPollinations(finalPrompt, width, height);

    // 4. Retry com prompt simples
    if (!result) {
      console.log("[GEN] >>> Retry Pollinations (prompt simples)...");
      const simplePrompt = `anime art, ${CHARACTERS[characterId] || 'anime character'}, ${STYLES[styleId] || 'high quality'}`;
      result = await fetchFromPollinations(simplePrompt, width, height);
      if (result) finalPrompt = simplePrompt;
    }

    // 5. Fallback AIRFORCE
    if (!result) {
      console.log("[GEN] >>> Pollinations indisponível. Tentando AirForce...");
      result = await fetchFromAirforce(finalPrompt, width, height);
    }

    // 6. Tudo falhou
    if (!result) {
      const now = Date.now();
      const timeSince = now - lastAirforceCall;
      if (timeSince < AIRFORCE_COOLDOWN_MS && AIRFORCE_KEY) {
        const waitSec = Math.ceil((AIRFORCE_COOLDOWN_MS - timeSince) / 1000);
        return { success: false, error: `Servidores ocupados. API reserva disponível em ${waitSec}s. Tente novamente.` };
      }
      return { success: false, error: "Servidores de IA indisponíveis. Aguarde 1-2 min e tente novamente." };
    }

    // 7. Converte para base64
    const base64 = result.buffer.toString("base64");
    const mimeType = result.contentType.includes("png") ? "image/png" : "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    console.log(`[GEN] ✅ OK: ${result.buffer.length} bytes`);

    // 8. Salva no Supabase (opcional)
    if (supabase) {
      try {
        const fileName = `${characterId}-${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(fileName, result.buffer, { contentType: 'image/jpeg' });

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
      return { success: false, error: "Timeout. Tente novamente." };
    }

    return { success: false, error: "Falha na conexão. Verifique sua internet." };
  }
}
