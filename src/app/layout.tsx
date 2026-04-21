import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Ai Anime Legends Generator — Crie Arte com IA",
  description: "Crie lendas com IA. Escolha seu personagem, defina o estilo e deixe o Anime Legends Generator criar uma obra-prima.",
  keywords: ["anime", "ia", "gerador de arte", "dragon ball", "naruto", "jujutsu kaisen", "one piece", "ai art"],
  robots: "index, follow",
  manifest: "/manifest.webmanifest",
  themeColor: "#05070a",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Anime Legends",
  },
  openGraph: {
    title: "Ai Anime Legends Generator",
    description: "Crie arte anime épica com IA. Escolha seu personagem, defina o estilo e deixe a IA criar uma obra-prima.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ai Anime Legends Generator",
    description: "Gerador de arte anime profissional com IA.",
  }
};

import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('celestial-theme');
                  var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
                  if (!theme && supportDarkMode) theme = 'dark';
                  if (theme === 'dark') document.documentElement.classList.add('dark-theme');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-sans min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground antialiased`}>
        <a href="#main-content" className="skip-link">Pular para o conteúdo</a>
        {children}
      </body>
    </html>
  );
}

