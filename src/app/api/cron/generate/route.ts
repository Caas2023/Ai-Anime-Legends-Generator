import { NextResponse } from "next/server";
import { generateImage } from "@/actions/generate";
import { CHARACTERS, ART_STYLES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  
  // Security Check (Vercel provides CRON_SECRET for this)
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  console.log("[CRON] Iniciando geração automática de 5 fotos...");
  const results = [];

  for (let i = 0; i < 5; i++) {
    const randomChar = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
    const randomStyle = ART_STYLES[Math.floor(Math.random() * ART_STYLES.length)];
    
    console.log(`[CRON] Gerando art ${i+1}: ${randomChar.id} em estilo ${randomStyle.id}`);
    
    try {
      const result = await generateImage(
        randomChar.id, 
        randomStyle.id, 
        "high quality, intricate details, community feature", 
        768, 
        1024,
        process.env.POLLINATIONS_API_KEY // Usa a chave global do site
      );
      results.push({ success: result.success, char: randomChar.id });
    } catch (err) {
      console.error(`[CRON ERROR] Falha na geração ${i+1}:`, err);
      results.push({ success: false, char: randomChar.id, error: String(err) });
    }
  }

  return NextResponse.json({
    message: "Cron job finalizado",
    processed: results.length,
    results
  });
}
