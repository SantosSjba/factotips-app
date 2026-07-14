import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/site";
import { TOOL_ROUTES } from "@/lib/seo/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl(TOOL_ROUTES.precios.landingPath),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: absoluteUrl(TOOL_ROUTES.precios.appPath),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
