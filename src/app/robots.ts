import type { MetadataRoute } from "next";

const BASE = "https://ui.it-handwerk-stuttgart.de";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private / nicht indexierbare Bereiche
        disallow: ["/profil", "/login"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
