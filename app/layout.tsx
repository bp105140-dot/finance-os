// app/layout.tsx
import { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FINANCE.OS | Gestão de Elite",
  description: "Sistema Operacional Financeiro",
  icons: {
    icon: "/icon.png", // Nome do arquivo que você colocou na pasta public
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}
