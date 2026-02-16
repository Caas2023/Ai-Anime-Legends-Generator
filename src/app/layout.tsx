import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Anime Legends Generator — Crie Arte Anime com IA",
  description: "Gere artes incríveis dos seus personagens favoritos de anime usando inteligência artificial. Escolha entre Goku, Naruto, Luffy e mais, com estilos únicos como Realista, Cyberpunk e Mangá.",
  openGraph: {
    title: "Anime Legends Generator",
    description: "Crie arte anime épica com IA. Escolha seu personagem, defina o estilo e deixe a IA criar uma obra-prima.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground`}>
        {children}
      </body>
    </html>
  );
}
