import type { Metadata } from "next";
import { absoluteUrl, SITE_BRAND, SITE_NAME } from "./site";

export type PageSeo = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  /** If set, shows as OG title override (defaults to title + brand) */
  ogTitle?: string;
};

export function buildPageMetadata({
  title,
  description,
  path,
  keywords = [],
  ogTitle,
}: PageSeo): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = title.includes(SITE_NAME) ? title : title;

  return {
    title: fullTitle,
    description,
    keywords: [
      SITE_NAME,
      SITE_BRAND,
      "Perú",
      ...keywords,
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: "es_PE",
      url,
      siteName: SITE_NAME,
      title: ogTitle ?? `${fullTitle} | ${SITE_NAME}`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle ?? `${fullTitle} | ${SITE_NAME}`,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}
