"use server";

import { supabase } from "@/lib/supabase";

// === CONFIGURAÇÃO ===
const POLLINATIONS_MODEL_PRIMARY = "flux";
const POLLINATIONS_MODEL_FALLBACK = "turbo";
const TIMEOUT_MS = 45000;
const MAX_PROMPT_LENGTH = 500;
const POLLINATIONS_KEY = process.env.POLLINATIONS_API_KEY;

// === PERSONAGENS ===
const CHARACTERS: Record<string, string> = {
  // Dragon Ball
  goku: "Son Goku from Dragon Ball Z, Super Saiyan hair, orange martial arts gi, muscular build, intense gaze",
  vegeta: "Vegeta from Dragon Ball, Saiyan armor, spiky hair, arms crossed, blue aura",
  gohan: "Son Gohan Beast form, silver hair, red eyes, purple gi, intense lightning aura, muscular",
  broly: "Broly Legendary Super Saiyan, massive muscles, green hair, shirtless, green energy aura, berserk",
  frieza: "Frieza Golden Form, gold and purple bio-armor, evil smirk, tail, cosmic background, death beam",

  // Naruto
  naruto: "Naruto Uzumaki Six Paths Sage Mode, yellow eyes, orange chakra cloak, floating truth seeker orbs",
  sasuke: "Sasuke Uchiha Rinnegan and Sharingan, purple Susanoo ribcage aura, sword of kusanagi, black cloak",
  kakashi: "Kakashi Hatake, silver hair, mask, Sharingan eye exposed, Chidori lightning in hand, Jonin vest",
  itachi: "Itachi Uchiha, Akatsuki cloak with red clouds, Sharingan eyes, crows flying around, mysterious",
  sakura: "Sakura Haruno, pink hair, Byakugou seal on forehead, red outfit, punching ground with impact",
  hinata: "Hinata Hyuga, Byakugan eyes, long dark blue hair, purple jacket, gentle expression, Twin Lion Fists aura",
  jiraiya: "Jiraiya Sage Mode, white spiky mane, red markings on face, sitting on giant toad, scroll on back",

  // One Piece
  luffy: "Monkey D. Luffy Gear 5 Nika, white hair and clothes, purple sash, laughing crazily, drum of liberation effects",
  zoro: "Roronoa Zoro, three swords style, green aura, scarred eye, bandana on head, demonic Enma aura",
  sanji: "Vinsmoke Sanji, Ifrit Jambe blue fire on leg, black suit, smoking cigarette, blonde hair covering one eye",
  nami: "Nami from One Piece, long orange hair, navigator outfit, holding Clima Tact, lightning effects",
  shanks: "Red-Haired Shanks, scar over eye, black cape, holding Gryphon sword, intense Conqueror Haki aura",
  law: "Trafalgar Law, spotted hat, nodachi sword, Room blue sphere effect, tattoos on fingers",
  ace: "Portgas D. Ace, fire fist, cowboy hat with beads, shirtless, Whitebeard tattoo on back",

  // Demon Slayer
  tanjiro: "Tanjiro Kamado, Sun Breathing Hinokami Kagura, fire sword effect, checkered haori, hanafuda earrings",
  nezuko: "Nezuko Kamado, bamboo muzzle, long black hair orange tips, pink kimono, cute demon eyes, creating pink fire",
  zenitsu: "Zenitsu Agatsuma, sleeping with snot bubble, Thunder Breathing lightning flash, yellow haori",
  inosuke: "Inosuke Hashibira, boar mask heading, dual serrated swords, shirtless, Beast Breathing blue aura",
  rengoku: "Kyojuro Rengoku, Flame Breathing, enthusiastic smile, bright yellow and red hair, fire tiger aura",
  shinobu: "Shinobu Kocho, Insect Breathing, purple butterfly aura, haori with butterfly pattern, holding rapier",

  // Jujutsu Kaisen
  gojo: "Satoru Gojo, white hair, blindfold removed showing blue Six Eyes, Infinity Void domain background",
  yuji: "Itadori Yuji, pink hair, black uniform with red hood, blue cursed energy on fists, divergent fist",
  megumi: "Megumi Fushiguro, summoning Divine Dog, black shadows, hand sign for domain expansion",
  nobara: "Nobara Kugisaki, holding hammer and nails, straw doll, confident smirk, crazy expression",
  sukuna: "Ryomen Sukuna, Yuji's body with tattoos, four eyes open, Malevolent Shrine background, evil grin",

  // Others
  saitama: "Saitama One Punch Man, bald head, yellow suit, white cape, red gloves, serious punch face",
  deku: "Izuku Midoriya Deku, green lightning Full Cowl 100%, vigilante costume damage, determined eyes",
  makima: "Makima Chainsaw Man, pink-red hair, hypnotic yellow ringed eyes, business suit, controlling chains",
  denji: "Chainsaw Man Denji, chainsaw head and arms, blood splatters, white shirt and tie, urban chaos",
  power: "Power Chainsaw Man, blood horns, messy blonde hair, blue jacket, creating blood hammer",
  eren: "Eren Yeager Season 4, man bun, green eyes, titan transformation marks, founding titan ribcage background",
  mikasa: "Mikasa Ackerman Season 4, black battle gear, red scarf, holding thunder spears, cold expression",
  levi: "Levi Ackerman, bloodied face, spinning attack with ODM gear, green scout cape, forest of giant trees",
  elric: "Edward Elric, blond braid, red coat, automail arm transmutation circle, alchemy sparks",
  light: "Light Yagami, holding Death Note, red eyes effect, Ryuk shadow behind him, dramatic lighting",
  killua: "Killua Zoldyck, Godspeed mode, white hair, blue electricity aura, assassin eyes",
  gon: "Gon Freecss, green outfit, holding fishing rod, Jajanken orange aura charging",
  sailormoon: "Sailor Moon Usagi Tsukino, magical girl outfit, blonde twin tails, tiara, sparkly moon background",
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
async function getDynamicPrompt(
  characterLabel: string,
  styleLabel: string,
  customDetails: string,
  apiKey?: string
): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const url = "https://gen.pollinations.ai/v1/chat/completions";

    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    } else if (POLLINATIONS_KEY) {
      headers["Authorization"] = `Bearer ${POLLINATIONS_KEY}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        model: "openai",
        messages: [
          {
            role: "system",
            content: `You are a creative anime art director who interprets user requests intelligently.

RULES:
1. BASE + STYLE: Start with the selected character and style.
2. EXTRA INSTRUCTIONS (CRITICAL):
   - "with X" or "fighting X" -> GENERATE TWO CHARACTERS. (e.g., "Naruto with Goku")
   - "as X" or "wearing X clothes" -> ONE CHARACTER doing cosplay. (e.g., "Naruto as Goku" = Naruto in orange gi)
   - "in X place" -> ONE CHARACTER in a specific background. (e.g., "Naruto in Paris")
3. If no Extra is given, create a unique epic scene.
4. Output ONLY the English image prompt (max 60 words). No notes.`,
          },
          {
            role: "user",
            content: `BASE CHARACTER: ${characterLabel}\nVISUAL STYLE: ${styleLabel}\nEXTRA INSTRUCTIONS: ${
              customDetails || "Create a unique epic random scene with this character"
            }`,
          },
        ],
        seed: Math.floor(Math.random() * 999999),
      }),
    });

    clearTimeout(timeout);

    if (response.ok) {
      const json = await response.json();
      let text = json?.choices?.[0]?.message?.content?.trim() || "";

      text = sanitizePrompt(text);

      if (text.length > MAX_PROMPT_LENGTH) text = text.substring(0, MAX_PROMPT_LENGTH);
      if (text.length > 10) {
        console.log("[PROMPT] Dinâmico OK:", text.substring(0, 80) + "...");
        return text;
      }
    }
  } catch {
    console.warn("[PROMPT] IA de texto indisponível.");
  }
  return null;
}

// === SANITIZA PROMPT ===
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

  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  return cleaned;
}

// ============================================================
// ✅ ÚNICA API: POLLINATIONS
// Tenta modelo primário (flux), depois fallback (turbo)
// SEM dependência de APIs externas
// ============================================================
async function fetchFromPollinations(
  prompt: string,
  width: number,
  height: number,
  model: string = POLLINATIONS_MODEL_PRIMARY,
  apiKey?: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const truncated = prompt.substring(0, MAX_PROMPT_LENGTH);
  const encoded = encodeURIComponent(truncated);
  const seed = Math.floor(Math.random() * 999999);

  // ✅ CORREÇÃO: removido &nologo=true para respeitar o branding da Pollinations
  const url = `https://gen.pollinations.ai/image/${encoded}?model=${model}&seed=${seed}&width=${width}&height=${height}`;

  console.log(`[POLLINATIONS] model=${model}, seed=${seed}, ${width}x${height}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const headers: Record<string, string> = {};
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    } else if (POLLINATIONS_KEY) {
      headers["Authorization"] = `Bearer ${POLLINATIONS_KEY}`;
    }

    const response = await fetch(url, { method: "GET", signal: controller.signal, headers });
    clearTimeout(timeoutId);

    console.log(`[POLLINATIONS] Status: ${response.status} | CT: ${response.headers.get("content-type")}`);

    if (response.ok) {
      const ct = response.headers.get("content-type") || "";
      if (ct.includes("image")) {
        const arrayBuffer = await response.arrayBuffer();
        return { buffer: Buffer.from(arrayBuffer), contentType: ct };
      }
    }

    console.warn(`[POLLINATIONS] Falhou com model=${model}: ${response.status}`);
  } catch (e: any) {
    console.warn(`[POLLINATIONS] Erro: ${e?.name || e}`);
  }
  return null;
}

// === EXPORTAÇÃO DE PROMPT (útil para Vídeos) ===
export async function composePrompt(
  characterId: string,
  styleId: string,
  customPrompt?: string,
  apiKey?: string
): Promise<string> {
  const characterLabel = CHARACTERS[characterId] || characterId;
  const styleLabel = STYLES[styleId] || styleId;

  let finalPrompt = await getDynamicPrompt(characterLabel, styleLabel, customPrompt || "", apiKey);
  if (!finalPrompt) {
    finalPrompt = `anime masterpiece, ${characterLabel}, ${styleLabel}, ${
      customPrompt || ""
    }, detailed face, cinematic`;
  }
  return finalPrompt;
}

// === FUNÇÃO PRINCIPAL ===
export async function generateImage(
  characterId: string,
  styleId: string,
  customPrompt?: string,
  width: number = 768,
  height: number = 1024,
  apiKey?: string,
  imageModel?: string
) {
  try {
    const characterLabel = CHARACTERS[characterId] || characterId;
    const styleLabel = STYLES[styleId] || styleId;

    console.log(`\n[GEN] ========================================`);
    console.log(`[GEN] ${characterId} | ${styleId} | ${new Date().toISOString()}`);

    // 1. Prompt dinâmico via IA de texto (Pollinations)
    let finalPrompt = await getDynamicPrompt(characterLabel, styleLabel, customPrompt || "", apiKey);

    // 2. Fallback: prompt fixo
    if (!finalPrompt) {
      finalPrompt = `anime masterpiece, ${characterLabel}, ${styleLabel}, ${
        customPrompt || ""
      }, detailed face, cinematic`;
    }

    console.log(`[GEN] Prompt: ${finalPrompt.substring(0, 100)}...`);

    // 3. Tenta modelo escolhido ou primário
    const targetModel = (apiKey && imageModel) ? imageModel : POLLINATIONS_MODEL_PRIMARY;
    console.log(`[GEN] >>> Tentando Pollinations (${targetModel})...`);
    let result = await fetchFromPollinations(finalPrompt, width, height, targetModel, apiKey);

    // 4. Retry com prompt simplificado no mesmo modelo
    if (!result) {
      console.log("[GEN] >>> Retry Pollinations flux (prompt simples)...");
      const simplePrompt = `anime art, ${CHARACTERS[characterId] || "anime character"}, ${
        STYLES[styleId] || "high quality"
      }`;
      result = await fetchFromPollinations(simplePrompt, width, height, POLLINATIONS_MODEL_PRIMARY, apiKey);
      if (result) finalPrompt = simplePrompt;
    }

    // 5. Retry com modelo alternativo: turbo
    if (!result) {
      console.log("[GEN] >>> Retry Pollinations (turbo)...");
      result = await fetchFromPollinations(finalPrompt, width, height, POLLINATIONS_MODEL_FALLBACK, apiKey);
    }

    // 6. Último retry: turbo + prompt simples
    if (!result) {
      console.log("[GEN] >>> Último retry Pollinations turbo (prompt simples)...");
      const simplePrompt = `anime art, ${CHARACTERS[characterId] || "anime character"}, ${
        STYLES[styleId] || "high quality"
      }`;
      result = await fetchFromPollinations(simplePrompt, width, height, POLLINATIONS_MODEL_FALLBACK, apiKey);
      if (result) finalPrompt = simplePrompt;
    }

    // 7. Tudo falhou
    if (!result) {
      return {
        success: false,
        error: "Servidores da Pollinations indisponíveis. Aguarde 1-2 minutos e tente novamente.",
      };
    }

    // 8. Converte para base64
    const base64 = result.buffer.toString("base64");
    const mimeType = result.contentType.includes("png") ? "image/png" : "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    console.log(`[GEN] ✅ OK: ${result.buffer.length} bytes`);

    // 9. Salva no Supabase (Mural da Comunidade)
    if (supabase) {
      try {
        // Tenta upload para storage primeiro
        const fileName = `${characterId}-${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("gallery")
          .upload(fileName, result.buffer, { contentType: "image/jpeg" });

        let finalUrl = dataUrl;

        if (!uploadError) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("gallery").getPublicUrl(fileName);
          finalUrl = publicUrl;
        } else {
          // Se falhou o storage, use o link direto do Pollinations (que é permanente)
          // Geramos o link direto novamente para garantir que temos um URL e não apenas o buffer
          const encoded = encodeURIComponent(finalPrompt);
          finalUrl = `https://pollinations.ai/p/${encoded}?width=${width}&height=${height}&model=${targetModel}&seed=${Math.floor(Math.random()*1000)}`;
        }

        // Salva na tabela do Mural Público
        if (supabase) {
           console.log(`[MURAL] Tentando salvar lenda: ${characterId} style: ${styleId}`);
           const { error: feedError } = await supabase.from("community_feed").insert({
            image_url: finalUrl,
            character_id: characterId,
            style_id: styleId,
            prompt: finalPrompt,
            is_video: false
          });
          
          if (feedError) {
             console.error("[MURAL ERROR] Falha ao inserir registro:", feedError.message);
          } else {
             console.log("[MURAL] Registro inserido com sucesso!");
          }
        } else {
           console.warn("[MURAL] Supabase não iniciado. Registro ignorado.");
        }

        if (!uploadError) {
           return { success: true, imageUrl: finalUrl, prompt: finalPrompt };
        }
      } catch (err: any) {
        console.warn("[SUPABASE FEED ERROR] Exceção capturada:", err.message);
      }
    }

    return { success: true, imageUrl: dataUrl, prompt: finalPrompt };

    return { success: true, imageUrl: dataUrl, prompt: finalPrompt };
  } catch (error: any) {
    console.error("[GEN FATAL]", error?.message || error);

    if (error?.name === "AbortError") {
      return { success: false, error: "Timeout. Tente novamente." };
    }

    return { success: false, error: "Falha na conexão. Verifique sua internet." };
  }
}
