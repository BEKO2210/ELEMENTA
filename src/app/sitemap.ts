import type { MetadataRoute } from "next";
import { fetchComponents } from "@/lib/data";

const BASE = "https://ui.it-handwerk-stuttgart.de";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const comps = await fetchComponents();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/explore`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/submit`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/docs/contribute`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/docs/guidelines`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/lizenz`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/impressum`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/datenschutz`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const componentRoutes: MetadataRoute.Sitemap = comps.map((c) => ({
    url: `${BASE}/c/${c.slug}`,
    lastModified: c.createdAt ? new Date(c.createdAt) : now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const authorRoutes: MetadataRoute.Sitemap = Array.from(
    new Set(comps.map((c) => c.author).filter(Boolean)),
  ).map((a) => ({
    url: `${BASE}/u/${encodeURIComponent(a)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...componentRoutes, ...authorRoutes];
}
