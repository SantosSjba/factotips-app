import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FactoTips | Herramientas útiles — Factosys Perú",
    template: "%s | FactoTips",
  },
  description:
    "FactoTips es el hub de herramientas de utilidad de Factosys Perú. Compara precios oficiales de medicamentos DIGEMID y más utilidades.",
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
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: "/",
    siteName: "FactoTips",
    title: "FactoTips | Herramientas útiles — Factosys Perú",
    description:
      "Hub de herramientas de utilidad de Factosys Perú. Empieza con el comparador de precios DIGEMID.",
  },
  twitter: {
    card: "summary_large_image",
    title: "FactoTips | Herramientas útiles",
    description:
      "Hub de herramientas de utilidad de Factosys Perú. Compara precios oficiales de medicamentos.",
  },
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
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
