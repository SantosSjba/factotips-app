import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { I18nProvider } from "@/lib/i18n/provider";
import { SITE_BRAND, SITE_NAME, getSiteUrl } from "@/lib/seo/site";
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
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_NAME} | Herramientas útiles — ${SITE_BRAND}`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "FactoTips es el hub de herramientas de utilidad de Factosys Perú. Calcula IGV, compara precios DIGEMID y más utilidades.",
  applicationName: SITE_NAME,
  authors: [{ name: SITE_BRAND }],
  creator: SITE_BRAND,
  publisher: SITE_BRAND,
  keywords: [
    SITE_NAME,
    SITE_BRAND,
    "Perú",
    "herramientas útiles",
    "calculadora IGV",
    "medicamentos",
    "precios",
    "DIGEMID",
  ],
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: "/",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Herramientas útiles — ${SITE_BRAND}`,
    description:
      "Hub de herramientas de utilidad de Factosys Perú. Calcula IGV y compara precios DIGEMID.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Herramientas útiles`,
    description:
      "Hub de herramientas de utilidad de Factosys Perú. Calcula IGV y compara precios oficiales.",
  },
  robots: {
    index: true,
    follow: true,
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
        <I18nProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </I18nProvider>
      </body>
    </html>
  );
}
