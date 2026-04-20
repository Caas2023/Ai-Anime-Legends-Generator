import fs from 'fs';
import path from 'path';
import https from 'https';

const CHARACTERS = [
  { id: "goku", label: "Goku" }, { id: "vegeta", label: "Vegeta" }, { id: "gohan", label: "Gohan" },
  { id: "broly", label: "Broly" }, { id: "frieza", label: "Frieza" }, { id: "naruto", label: "Naruto" },
  { id: "sasuke", label: "Sasuke" }, { id: "kakashi", label: "Kakashi" }, { id: "itachi", label: "Itachi" },
  { id: "sakura", label: "Sakura" }, { id: "hinata", label: "Hinata" }, { id: "jiraiya", label: "Jiraiya" },
  { id: "luffy", label: "Luffy" }, { id: "zoro", label: "Zoro" }, { id: "sanji", label: "Sanji" },
  { id: "nami", label: "Nami" }, { id: "shanks", label: "Shanks" }, { id: "law", label: "Law" },
  { id: "ace", label: "Ace" }, { id: "nezuko", label: "Nezuko" }, { id: "tanjiro", label: "Tanjiro" },
  { id: "zenitsu", label: "Zenitsu" }, { id: "inosuke", label: "Inosuke" }, { id: "rengoku", label: "Rengoku" },
  { id: "shinobu", label: "Shinobu" }, { id: "gojo", label: "Gojo" }, { id: "yuji", label: "Yuji" },
  { id: "megumi", label: "Megumi" }, { id: "nobara", label: "Nobara" }, { id: "sukuna", label: "Sukuna" },
  { id: "makima", label: "Makima" }, { id: "denji", label: "Denji" }, { id: "power", label: "Power" },
  { id: "eren", label: "Eren" }, { id: "mikasa", label: "Mikasa" }, { id: "levi", label: "Levi" },
  { id: "saitama", label: "Saitama" }, { id: "deku", label: "Deku" }, { id: "elric", label: "Edward" },
  { id: "light", label: "Light" }, { id: "killua", label: "Killua" }, { id: "gon", label: "Gon" },
  { id: "sailormoon", label: "Sailor Moon" }, { id: "ichigo", label: "Ichigo" },
  { id: "naruto_sage", label: "Naruto Sage" }, { id: "sanji_raid", label: "Sanji Stealth" },
  { id: "mikasa_final", label: "Mikasa Ackerman" }, { id: "gojo_unleashed", label: "Gojo Satoru" }
];

const TARGET_DIR = path.join(process.cwd(), 'public', 'avatars');

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

async function downloadWithRetry(char, attempt = 1) {
  const filePath = path.join(TARGET_DIR, `${char.id}.jpg`);
  
  if (fs.existsSync(filePath)) {
    console.log(`[PULAR] ${char.id} já existe.`);
    return;
  }

  const charSeed = char.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(char.label + " anime portrait, high quality, centered")}?width=256&height=256&nologo=true&seed=${charSeed}&model=flux`;

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 429) {
        if (attempt <= 3) {
          const waitTime = attempt * 10000; // 10s, 20s, 30s
          console.warn(`[429] Rate limit em ${char.id}. Tentativa ${attempt}/3. Aguardando ${waitTime/1000}s...`);
          setTimeout(() => downloadWithRetry(char, attempt + 1).then(resolve).catch(reject), waitTime);
        } else {
          reject(new Error(`Rate limit persistente para ${char.id}`));
        }
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`Erro ${res.statusCode} em ${char.id}`));
        return;
      }

      const fileStream = fs.createWriteStream(filePath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`[SUCESSO] ${char.id}.jpg baixado.`);
        resolve();
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log(`--- Iniciando Sincronização Robusta (${CHARACTERS.length} personagens) ---`);
  
  for (let i = 0; i < CHARACTERS.length; i++) {
    const char = CHARACTERS[i];
    console.log(`[${i + 1}/${CHARACTERS.length}] Processando: ${char.id}...`);
    
    try {
      await downloadWithRetry(char);
      // Intervalo de segurança de 4 segundos entre novos downloads com sucesso
      await new Promise(r => setTimeout(r, 4000)); 
    } catch (err) {
      console.error(`[FALHA] ${char.id}: ${err.message}`);
    }
  }

  console.log("--- Sincronização Finalizada ---");
}

run();
