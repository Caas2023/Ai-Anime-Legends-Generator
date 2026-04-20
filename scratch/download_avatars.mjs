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
];

const TARGET_DIR = path.join(process.cwd(), 'public', 'avatars');

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

async function downloadImage(char) {
  const charSeed = char.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(char.label + " anime portrait, high quality, vibrant colors, centered")}?width=256&height=256&nologo=true&seed=${charSeed}&model=flux`;
  const filePath = path.join(TARGET_DIR, `${char.id}.jpg`);

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download ${char.id}: ${res.statusCode}`));
        return;
      }

      // Check Content-Type
      const contentType = res.headers['content-type'];
      if (contentType && contentType.includes('text/html')) {
          reject(new Error(`Pollinations returned HTML for ${char.id}`));
          return;
      }

      const fileStream = fs.createWriteStream(filePath);
      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`✓ Baixado: ${char.id}.jpg`);
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filePath, () => reject(err));
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function run() {
  console.log(`Iniciando download de ${CHARACTERS.length} avatares (modo lento para evitar 429)...`);
  
  for (let i = 0; i < CHARACTERS.length; i++) {
    const char = CHARACTERS[i];
    console.log(`[${i+1}/${CHARACTERS.length}] Baixando: ${char.id}...`);
    
    try {
      await downloadImage(char);
      // Espera 2 segundos entre cada download para não ser bloqueado
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (err) {
      console.error(`Erro em ${char.id}: ${err.message}`);
    }
  }

  console.log("Download concluído!");
}

run();
