import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ai Anime Legends Generator — Crie Arte com IA",
  description: "Crie lendas com IA. Escolha seu personagem, defina o estilo e deixe o Anime Legends Generator criar uma obra-prima.",
  openGraph: {
    title: "Ai Anime Legends Generator",
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
