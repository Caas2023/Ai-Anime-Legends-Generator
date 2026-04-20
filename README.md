<div align="center">
  <img src="public/logo.png" width="150" height="150" style="border-radius: 50%; box-shadow: 0 0 20px cyan;" alt="Ai Anime Legends Logo" />
</div>

# Ai Anime Legends Generator 🎨

Gere artes e **vídeos épicos** dos seus personagens favoritos de anime usando **fluxos avançados de Inteligência Artificial**.

## 🧠 Como Funciona

1. **GPT-4o (IA de Texto)** — Enriquece a sua ideia crua gerando um super-prompt descritivo em inglês.
2. **Pollinations AI (Image & Video)** — Transforma o super-prompt em uma arte fantástica ou em **vídeos animados (MP4)**.

## 🚀 Tecnologias

- **Next.js 16** (App Router + Server Actions)
- **Tailwind CSS v4** (Design System)
- **Framer Motion** (Animações Premium)
- **Pollinations.ai API** (Geração Gratuita Custo-Zero de Imagens + Vídeo)
- **Supabase** (Storage + Database)

## 🎮 Personagens Disponíveis

Goku • Naruto • Luffy • Sailor Moon • Ichigo • Zoro • Nezuko • Gojo • Makima • Vegeta

## 🎨 Estilos Artísticos

Flux Original • Realista • 3D Render • Retro 90s • Mangá • Cyberpunk • Aquarela • Sombrio

## ⚡ Novas Funcionalidades (BYOP & Video)

- 💸 **Bring Your Own Pollen (BYOP):** Conecte com sua própria cota do *Pollinations*. O aplicativo lê o token secretamente através da URL fragmentada.
- 🎬 **Criação de Vídeo MP4 (Exclusivo):** Ao autenticar com o BYOP, libere o botão "Animar Lenda" que baixa animações em vídeo utilizando Streaming Client-Side (resiliência a timeouts).
- ✅ Prompts dinâmicos e enriquecidos com IA na hora.
- ✅ Botão auto-mágico "Melhorar Prompt"
- ✅ Player Cinematográfico na Galeria para rodar os Vídeos.
- ✅ Download Direto & WebShare API Compartilhamento.
- ✅ Efeitos sonoros procedurais (Web Audio API)

## 🔧 Como Rodar Localmente

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure o `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=sua_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave
   POLLINATIONS_API_KEY=sua_chave
   ```
4. Rode o servidor:
   ```bash
   npm run dev
   ```
5. Acesse `http://localhost:5000`

## 📜 Créditos

- **API:** [Pollinations.ai](https://pollinations.ai)
- **Modelos:** Imagen-4 (Imagem) + GPT-4o (Texto)
- **Badge:** Built with Pollinations.ai

---

Desenvolvido por [Caas2023](https://github.com/Caas2023)
