import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "NA2S — Gestão que sobe junto",
  description: "Sistema de gestão operacional e financeira NA2S",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${spaceGrotesk.variable} h-full`}>
      <body
        className="min-h-full antialiased"
        style={{
          backgroundColor: "var(--na2s-noite)",
          color: "var(--na2s-papel)",
          fontFamily: "var(--font-space-grotesk), var(--font-display)",
        }}
      >
        {children}
      </body>
    </html>
  );
}
