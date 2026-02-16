"use server";

import { supabase } from "@/lib/supabase";

// === CONFIGURAÇÃO ===
const POLLINATIONS_MODEL = "flux";
const TIMEOUT_MS = 45000;
const MAX_PROMPT_LENGTH = 500;
const POLLINATIONS_KEY = process.env.POLLINATIONS_API_KEY;
const AIRFORCE_KEY = process.env.AIRFORCE_API_KEY;
const AIRFORCE_COOLDOWN_MS = 61000; // 61 segundos entre chamadas

// Controle de rate limit do AirForce (em memória do servidor)
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

// === IA DE TEXTO (Prompt Dinâmico) ===
async function getDynamicPrompt(characterLabel: string, styleLabel: string, customDetails: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    // SEM autenticação — a API de texto funciona sem chave (anônimo)
    // e COM chave ela injeta avisos de depreciação no texto
    const response = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are an anime art director. Create a SHORT (max 60 words) unique image prompt. Vary pose, mood, lighting, scene. Output ONLY the English prompt text. No warnings, no notes, no explanations." },
          { role: "user", content: `Character: ${characterLabel}. Style: ${styleLabel}. Extra: ${customDetails || 'epic random scene'}.` }
        ],
        model: "openai",
        seed: Math.floor(Math.random() * 999999)
      })
    });

    clearTimeout(timeout);

    if (response.ok) {
      let text = (await response.text()).trim();

      // Remove qualquer aviso/lixo injetado pela API
      text = sanitizePrompt(text);

      if (text.length > MAX_PROMPT_LENGTH) text = text.substring(0, MAX_PROMPT_LENGTH);
      if (text.length > 20) return text;
    }
  } catch {
    console.warn("[PROMPT] IA de texto indisponível.");
  }
  return null;
}

/**
 * Limpa o prompt removendo avisos, notas e lixo injetado pela API
 */
function sanitizePrompt(text: string): string {
  // Remove blocos que contenham avisos típicos
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

  // Remove linhas vazias extras
  cleaned = cleaned.replace(/\n{3,}/g, "\n").trim();

  // Remove aspas que envolvam o prompt inteiro
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  return cleaned;
}

// === API PRINCIPAL: POLLINATIONS ===
async function fetchFromPollinations(prompt: string, width: number, height: number): Promise<{ buffer: Buffer; contentType: string } | null> {
  const encoded = encodeURIComponent(prompt.substring(0, MAX_PROMPT_LENGTH));
  const seed = Math.floor(Math.random() * 999999);
  const url = `https://image.pollinations.ai/prompt/${encoded}?model=${POLLINATIONS_MODEL}&seed=${seed}&width=${width}&height=${height}&nologo=true`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const headers: Record<string, string> = {};
    if (POLLINATIONS_KEY) headers["Authorization"] = `Bearer ${POLLINATIONS_KEY}`;

    const response = await fetch(url, { method: "GET", signal: controller.signal, headers });
    clearTimeout(timeoutId);

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

  // Verifica rate limit de 61 segundos
  const now = Date.now();
  const timeSinceLastCall = now - lastAirforceCall;
  if (timeSinceLastCall < AIRFORCE_COOLDOWN_MS) {
    const waitTime = Math.ceil((AIRFORCE_COOLDOWN_MS - timeSinceLastCall) / 1000);
    console.warn(`[AIRFORCE] Rate limit: aguardar mais ${waitTime}s.`);
    return null;
  }

  // Mapeia tamanhos suportados
  let size = "1024x1024";
  if (width > height) size = "1024x768";
  else if (height > width) size = "768x1024";

  console.log(`[AIRFORCE] Tentando gerar com modelo plutogen-o1...`);

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
    lastAirforceCall = Date.now(); // Atualiza timestamp mesmo se falhar (respeitar rate limit)

    if (!response.ok) {
      console.warn(`[AIRFORCE] API retornou: ${response.status}`);
      return null;
    }

    // Processa SSE response
    const text = await response.text();
    const lines = text.split("\n");

    let imageUrl: string | null = null;

    for (const line of lines) {
      if (line.startsWith("data: ") && line !== "data: [DONE]" && !line.includes("keepalive")) {
        try {
          const data = JSON.parse(line.substring(6));
          // Busca URL da imagem no response
          if (data?.data?.[0]?.url) {
            imageUrl = data.data[0].url;
            break;
          }
          if (data?.url) {
            imageUrl = data.url;
            break;
          }
        } catch {
          // Linha SSE inválida, pula
        }
      }
    }

    if (!imageUrl) {
      // Tenta parsear como JSON direto (sem SSE)
      try {
        const json = JSON.parse(text);
        imageUrl = json?.data?.[0]?.url || json?.url || null;
      } catch {
        console.warn("[AIRFORCE] Formato de resposta não reconhecido.");
      }
    }

    if (imageUrl) {
      console.log(`[AIRFORCE] Imagem gerada! Baixando de: ${imageUrl.substring(0, 80)}...`);

      // Baixa a imagem da URL retornada
      const imgResponse = await fetch(imageUrl);
      if (imgResponse.ok) {
        const ct = imgResponse.headers.get("content-type") || "image/png";
        const arrayBuffer = await imgResponse.arrayBuffer();
        return { buffer: Buffer.from(arrayBuffer), contentType: ct };
      }
    }

    console.warn("[AIRFORCE] Nenhuma URL de imagem encontrada na resposta.");
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
    console.log(`[GEN] Personagem: ${characterId} | Estilo: ${styleId}`);

    // 1. Prompt dinâmico via IA de texto
    let finalPrompt = await getDynamicPrompt(characterLabel, styleLabel, customPrompt || "");

    // 2. Fallback: prompt fixo
    if (!finalPrompt) {
      finalPrompt = `anime masterpiece, ${characterLabel}, ${styleLabel}, ${customPrompt || ''}, detailed face, cinematic`;
    }

    console.log(`[GEN] Prompt: ${finalPrompt.substring(0, 100)}...`);

    // 3. Tenta POLLINATIONS primeiro
    console.log("[GEN] Tentando Pollinations...");
    let result = await fetchFromPollinations(finalPrompt, width, height);

    // 4. Se falhou, tenta Pollinations com prompt simples
    if (!result) {
      console.log("[GEN] Retry Pollinations com prompt simples...");
      const simplePrompt = `anime art, ${CHARACTERS[characterId] || 'anime character'}, ${STYLES[styleId] || 'high quality'}`;
      result = await fetchFromPollinations(simplePrompt, width, height);
      if (result) finalPrompt = simplePrompt;
    }

    // 5. Se ainda falhou, tenta AIRFORCE como reserva
    if (!result) {
      console.log("[GEN] Pollinations indisponível. Tentando AirForce...");
      result = await fetchFromAirforce(finalPrompt, width, height);
    }

    // 6. Se tudo falhou
    if (!result) {
      const now = Date.now();
      const timeSinceLastAirforce = now - lastAirforceCall;
      if (timeSinceLastAirforce < AIRFORCE_COOLDOWN_MS && AIRFORCE_KEY) {
        const waitSec = Math.ceil((AIRFORCE_COOLDOWN_MS - timeSinceLastAirforce) / 1000);
        return { success: false, error: `Servidores ocupados. API reserva disponível em ${waitSec}s. Tente novamente.` };
      }
      return { success: false, error: "Ambos os servidores de IA estão indisponíveis. Aguarde 1-2 min." };
    }

    // 7. Converte para base64
    const base64 = result.buffer.toString("base64");
    const mimeType = result.contentType.includes("png") ? "image/png" : "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    console.log(`[GEN] ✅ Imagem OK: ${result.buffer.length} bytes`);

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
      return { success: false, error: "Timeout. Tente um tamanho menor." };
    }

    return { success: false, error: "Falha na conexão. Verifique sua internet." };
  }
}
