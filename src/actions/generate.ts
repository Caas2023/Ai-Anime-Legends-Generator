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

export async function generateImage(
  characterId: string,
  styleId: string,
  extraPrompt: string = "",
  width: number = 768,
  height: number = 1024,
  apiKey?: string,
  model?: string
) {
  try {
    const characterBase = CHARACTERS[characterId] || "Anime character";
    const styleBase = STYLES[styleId] || STYLES.flux;
    // Escolha do Modelo: Usa o fornecido ou decide pelo estilo
    const targetModel = model || (styleId === "realistic" ? POLLINATIONS_MODEL_FALLBACK : POLLINATIONS_MODEL_PRIMARY);
    
    // Composição do Prompt Final
    const finalPrompt = `${characterBase}, in a unique epic random scene: ${extraPrompt}, ${styleBase}, intricate background, masterpiece, trending on pixiv`;
    
    // Link básico do Pollinations
    const encodedPrompt = encodeURIComponent(finalPrompt.substring(0, MAX_PROMPT_LENGTH));
    const pollinationsUrl = `https://pollinations.ai/p/${encodedPrompt}?width=${width}&height=${height}&model=${targetModel}&seed=${Math.floor(Math.random() * 1000000)}&nologo=true`;

    console.log(`[GENERATING] ${characterId} with style ${styleId}... SDK usage simulation.`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    // Fazemos a chamada para garantir que a imagem seja gerada e obter o buffer
    const response = await fetch(pollinationsUrl, { 
       signal: controller.signal,
       headers: apiKey ? { "Authorization": `Bearer ${apiKey}` } : {}
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`Pollinations API error: ${response.status}`);

    const buffer = await response.arrayBuffer();
    // Tentar salvar no Supabase (Storage + Table) se estiver configurado
    if (supabase) {
      try {
        const fileName = `${Date.now()}-${characterId}.webp`;
        let finalUrl = pollinationsUrl;

        // 1. Tentar upload para o Storage Bucket 'gallery'
        const { error: uploadError } = await supabase.storage
          .from("gallery")
          .upload(fileName, buffer, {
            contentType: "image/webp",
            cacheControl: "3600",
          });

        if (!uploadError) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("gallery").getPublicUrl(fileName);
          finalUrl = publicUrl;
        } else {
          // Fallback persistente caso o Storage falhe
          // Usamos o modelo 'turbo' que é mais leve e rápido para fallbacks
          const safeSlug = encodeURIComponent(`${characterId} anime art`);
          finalUrl = `https://pollinations.ai/p/${safeSlug}?width=${width}&height=${height}&model=${POLLINATIONS_MODEL_FALLBACK}&seed=${Math.floor(Math.random()*1000000)}&nologo=true`;
          console.warn("[MURAL] Storage offline. Usando link de fallback Pollinations Turbo.");
        }

        // 2. Salvar na Tabela community_feed
        const { error: feedError } = await supabase.from("community_feed").insert({
          image_url: finalUrl,
          character_id: characterId,
          style_id: styleId,
          prompt: finalPrompt,
          is_video: false
        });

        if (feedError) console.error("[MURAL ERROR] Falha no insert:", feedError.message);
        
        // Retornamos a URL final (Supabase ou Pollinations Fallback)
        return { success: true, imageUrl: finalUrl, prompt: finalPrompt };
      } catch (err: any) {
        console.warn("[SUPABASE ERROR] Falha na persistência:", err.message);
      }
    }

    // Se nem o Supabase estiver configurado, retorna o link do Pollinations direto
    return { success: true, imageUrl: pollinationsUrl, prompt: finalPrompt };

  } catch (error: any) {
    console.error("[GENERATE ERROR]", error);
    return { success: false, error: error.message || "Falha na geração da lenda" };
  }
}

export async function composePrompt(characterId: string, styleId: string, scene: string) {
    const characterBase = CHARACTERS[characterId] || "Anime character";
    const styleBase = STYLES[styleId] || STYLES.flux;
    return `${characterBase}, ${scene}, ${styleBase}`;
}
