import fs from 'fs';
import path from 'path';
import https from 'https';

const CHARACTERS = [
  { id: "goku", label: "Goku" },
  { id: "vegeta", label: "Vegeta" },
  { id: "gohan", label: "Gohan" },
  { id: "broly", label: "Broly" },
  { id: "frieza", label: "Frieza" },
  { id: "naruto", label: "Naruto" },
  { id: "sasuke", label: "Sasuke" },
  { id: "kakashi", label: "Kakashi" },
  { id: "itachi", label: "Itachi" },
  { id: "sakura", label: "Sakura" },
  { id: "hinata", label: "Hinata" },
  { id: "jiraiya", label: "Jiraiya" },
  { id: "luffy", label: "Luffy" },
  { id: "zoro", label: "Zoro" },
  { id: "sanji", label: "Sanji" },
  { id: "nami", label: "Nami" },
  { id: "shanks", label: "Shanks" },
  { id: "law", label: "Law" },
  { id: "ace", label: "Ace" },
  { id: "nezuko", label: "Nezuko" },
  { id: "tanjiro", label: "Tanjiro" },
  { id: "zenitsu", label: "Zenitsu" },
  { id: "inosuke", label: "Inosuke" },
  { id: "rengoku", label: "Rengoku" },
  { id: "shinobu", label: "Shinobu" },
  { id: "gojo", label: "Gojo" },
  { id: "yuji", label: "Yuji" },
  { id: "megumi", label: "Megumi" },
  { id: "nobara", label: "Nobara" },
  { id: "sukuna", label: "Sukuna" },
  { id: "makima", label: "Makima" },
  { id: "denji", label: "Denji" },
  { id: "power", label: "Power" },
  { id: "eren", label: "Eren" },
  { id: "mikasa", label: "Mikasa" },
  { id: "levi", label: "Levi" },
  { id: "saitama", label: "Saitama" },
  { id: "deku", label: "Deku" },
  { id: "elric", label: "Edward Elric" },
  { id: "light", label: "Light Yagami" },
  { id: "killua", label: "Killua" },
  { id: "gon", label: "Gon" },
  { id: "sailormoon", label: "Sailor Moon" },
  { id: "ichigo", label: "Ichigo" },
  // Adicionando os que faltavam para completar a lista do constants.ts
  { id: "naruto_sage", label: "Naruto Sage" },
  { id: "sanji_raid", label: "Sanji Stealth" },
  { id: "mikasa_final", label: "Mikasa Ackerman" },
  { id: "gojo_unleashed", label: "Gojo Satoru" }
];

const TARGET_DIR = path.join(process.cwd(), 'public', 'avatars');

async function downloadImage(char) {
  const filePath = path.join(TARGET_DIR, `${char.id}.jpg`);
  
  // Se já existe, pula
  if (fs.existsSync(filePath)) {
    console.log(`- Já existe: ${char.id}.jpg`);
    return;
  }

  const charSeed = char.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(char.label + " anime portrait, high resolution, centered")}?width=256&height=256&nologo=true&seed=${charSeed}`;

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Status ${res.statusCode}`));
        return;
      }
      const fileStream = fs.createWriteStream(filePath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`✓ Baixado: ${char.id}.jpg`);
        resolve();
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log(`Sincronizando ${CHARACTERS.length} avatares...`);
  for (let i = 0; i < CHARACTERS.length; i++) {
    const char = CHARACTERS[i];
    try {
      await downloadImage(char);
      await new Promise(r => setTimeout(r, 2500)); // 2.5s delay
    } catch (e) {
      console.error(`Erro em ${char.id}: ${e.message}`);
    }
  }
  console.log("Sincronização finalizada!");
}

run();
