import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Configuração da fonte padrão do projeto
const inter = Inter({ subsets: ["latin"] });

// Aqui é onde a mágica do nome na aba do navegador acontece!
// O Next.js usa essa constante 'metadata' para injetar as tags <title> e <meta> no HTML
export const metadata: Metadata = {
  title: "FinLab | by DevLabzz",
  description: "Sistema profissional de gestão financeira criado pela DevLabzz.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Alteramos o idioma (lang) para pt-BR, o que é uma boa prática de acessibilidade e SEO
    <html lang="pt-BR">
      <body className={inter.className}>
        {/* O 'children' representa todas as páginas do seu app (como o login, dashboard, etc) */}
        {children}
      </body>
    </html>
  );
}
