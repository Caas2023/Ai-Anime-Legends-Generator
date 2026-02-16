"use server";

// Using flux model from Pollinations (best quality free model)
const MODEL = "flux";
const TIMEOUT_MS = 60000;

// API Key 
const API_KEY = "sk_CYFcjzBiyuHmEZjq3WoUbtWz2k6CgBPN";

// Character detailed prompts
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

// Style modifiers
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

export async function generateImage(characterId: string, styleId: string) {
  const characterPrompt = CHARACTERS[characterId] || CHARACTERS.goku;
  const styleModifier = STYLES[styleId] || STYLES.flux;
  
  // Combine prompts
  const finalPrompt = `masterpiece, best quality, ${characterPrompt}, ${styleModifier}, looking at viewer, detailed face`;
  
  const encodedPrompt = encodeURIComponent(finalPrompt);
  const seed = Math.floor(Math.random() * 1000000);

  // Build URL with flux model
  const url = `https://gen.pollinations.ai/image/${encodedPrompt}?model=${MODEL}&seed=${seed}&width=768&height=1024&nologo=true`;

  console.log(`Generating: ${characterId} in ${styleId} style`);
  console.log("Prompt:", finalPrompt);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Referer": "https://anime-legends.vercel.app", // Good practice
      },
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    // Check for specific error status
    if (response.status === 429) {
      return { success: false, error: "Muitos pedidos. Aguarde um momento." };
    }

    if (!response.ok) {
      console.error(`API Error: ${response.status}`);
      return { success: false, error: `Erro na API: ${response.status}` };
    }
    
    const contentType = response.headers.get("content-type");
    
    if (contentType?.includes("image")) {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString("base64");
      const mimeType = contentType || "image/jpeg";
      const dataUrl = `data:${mimeType};base64,${base64}`;
      
      return { success: true, imageUrl: dataUrl };
    }
    
    return { success: false, error: "Formato de resposta inválido" };
    
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { success: false, error: "Tempo limite excedido. Tente novamente." };
    }
    console.error("Generate Error:", error);
    return { success: false, error: "Falha na conexão com o servidor" };
  }
}
