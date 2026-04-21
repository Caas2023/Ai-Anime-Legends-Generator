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

  console.log(`[CRON] Iniciando ciclo de aquecimento do banco às ${new Date().toISOString()}`);
  const results = [];

  for (let i = 0; i < 5; i++) {
    const randomChar = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
    const randomStyle = ART_STYLES[Math.floor(Math.random() * ART_STYLES.length)];
    
    console.log(`[CRON] Evento ${i+1}/5: Gerando ${randomChar.label} (${randomChar.id}) em estilo ${randomStyle.label}`);
    
    try {
      const result = await generateImage(
        randomChar.id, 
        randomStyle.id, 
        "epic automatic daily highlight, masterpiece, community favorite", 
        768, 
        1024,
        process.env.POLLINATIONS_API_KEY
      );
      results.push({ success: result?.success || false, char: randomChar.id, style: randomStyle.id });
    } catch (err) {
      console.error(`[CRON ERROR] Falha no evento ${i+1}:`, err);
      results.push({ success: false, char: randomChar.id, error: String(err) });
    }
  }

  console.log(`[CRON] Ciclo finalizado com ${results.filter(r => r.success).length} sucessos.`);

  return NextResponse.json({
    message: "Cron job finalizado",
    processed: results.length,
    results
  });
}
