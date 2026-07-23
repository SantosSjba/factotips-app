import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { I18nProvider } from "@/lib/i18n/provider";
import { SITE_BRAND, SITE_NAME, getSiteUrl } from "@/lib/seo/site";
import { HUB_SEO } from "@/lib/seo/tools";
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
    default: HUB_SEO.ogTitle ?? `${SITE_NAME} | ${HUB_SEO.title}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: HUB_SEO.description,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_BRAND }],
  creator: SITE_BRAND,
  publisher: SITE_BRAND,
  keywords: HUB_SEO.keywords,
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: "/",
    siteName: SITE_NAME,
    title: HUB_SEO.ogTitle ?? `${SITE_NAME} | ${HUB_SEO.title}`,
    description: HUB_SEO.description,
  },
  twitter: {
    card: "summary_large_image",
    title: HUB_SEO.ogTitle ?? `${SITE_NAME} | ${HUB_SEO.title}`,
    description: HUB_SEO.description,
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
