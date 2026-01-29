import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google"; // Syne é a fonte do luxo e modernidade
import "./globals.css";

// Inter para textos de leitura (corpo)
const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter" 
});

// Syne para títulos (luxo, larga e moderna)
const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

export const metadata: Metadata = {
  title: "DinizDev IA | Elite Web Generation",
  description: "Criação de landing pages de alto padrão com inteligência artificial.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" className="scroll-smooth">
      <body
        className={`${inter.variable} ${syne.variable} antialiased bg-[#020617] text-slate-200 selection:bg-emerald-500/30`}
      >
        {/* Camada de Luxo: Efeito de Grão e Nebulosa de Fundo */}
        <div className="fixed inset-0 z-[-1] pointer-events-none">
          {/* Luzes difusas de fundo (Mesh Gradient) */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/20 blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] rounded-full bg-blue-900/20 blur-[100px]" />
          
          {/* Textura de ruído sutil para parecer papel/premium */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>

        {/* Container principal com transição suave */}
        <div className="relative min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}