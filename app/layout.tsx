import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FactoTips | Herramientas útiles — Factosys Perú",
    template: "%s | FactoTips",
  },
  description:
    "FactoTips es el hub de herramientas de utilidad de Factosys Perú. Empieza con el comparador de precios de medicamentos DIGEMID.",
  applicationName: "FactoTips",
  authors: [{ name: "Factosys Perú" }],
  keywords: [
    "FactoTips",
    "Factosys",
    "Perú",
    "medicamentos",
    "precios",
    "DIGEMID",
    "herramientas",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${manrope.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans text-foreground bg-background">
        {children}
      </body>
    </html>
  );
}
