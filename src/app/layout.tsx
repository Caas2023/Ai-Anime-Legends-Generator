import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: 'swap', // Otimização de Performance: Evita layout shift de fontes
});

const outfit = Outfit({ 
  subsets: ["latin"], 
  variable: "--font-outfit",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Ai Anime Legends Generator — Crie Arte com IA",
  description: "Crie lendas com IA. Escolha seu personagem, defina o estilo e deixe o Anime Legends Generator criar uma obra-prima profissional.",
  keywords: ["anime", "ia", "gerador de arte", "dragon ball", "naruto", "jujutsu kaisen", "one piece", "ai art", "pwa"],
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
    description: "Crie arte anime épica com IA profissional. Alta qualidade e estilos exclusivos.",
    type: "website",
    url: "https://anime.caasexpresss.com/",
    siteName: "Ai Anime Legends",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ai Anime Legends Generator",
    description: "Gerador de arte anime profissional com IA.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://anime.caasexpresss.com/" />
        {/* JSON-LD: Structured Data para SEO 100/100 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Ai Anime Legends Generator",
              "applicationCategory": "MultimediaApplication",
              "operatingSystem": "Web, Android, iOS",
              "description": "Ferramenta de IA para geração de arte anime profissional.",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
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
      <body className={`${inter.variable} ${outfit.variable} font-sans min-h-screen bg-background text-foreground antialiased selection:bg-primary/30`}>
        <a href="#main-content" className="skip-link">Pular para o conteúdo</a>
        {children}
      </body>
    </html>
  );
}
