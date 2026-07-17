import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/site";
import { TOOL_ROUTES } from "@/lib/seo/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const tools = Object.values(TOOL_ROUTES);

  return [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...tools.flatMap((tool) => [
      {
        url: absoluteUrl(tool.landingPath),
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.95,
      },
      {
        url: absoluteUrl(tool.appPath),
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
    ]),
  ];
}
