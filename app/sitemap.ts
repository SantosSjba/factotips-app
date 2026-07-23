import type { MetadataRoute } from "next";
import {
  getAllPdfTools,
  pdfToolAppPath,
  pdfToolLandingPath,
} from "@/lib/pdf/tools";
import { absoluteUrl } from "@/lib/seo/site";
import { TOOL_ROUTES } from "@/lib/seo/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const tools = Object.values(TOOL_ROUTES);
  const known = new Set<string>(
    tools.flatMap((tool) => [tool.landingPath, tool.appPath]),
  );

  const pdfNested = getAllPdfTools()
    .filter((tool) => tool.available)
    .flatMap((tool) => {
      const landingPath = pdfToolLandingPath(tool.slug);
      const appPath = pdfToolAppPath(tool.slug);
      const entries: MetadataRoute.Sitemap = [];
      if (!known.has(landingPath)) {
        entries.push({
          url: absoluteUrl(landingPath),
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.9,
        });
      }
      if (!known.has(appPath)) {
        entries.push({
          url: absoluteUrl(appPath),
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
      return entries;
    });

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
    ...pdfNested,
  ];
}
