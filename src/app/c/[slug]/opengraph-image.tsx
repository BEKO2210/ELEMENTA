import { ImageResponse } from "next/og";
import { fetchComponent } from "@/lib/data";
import { CATEGORIES } from "@/lib/mock-data";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "Jetzt ansehen: UI-Komponente auf Elementa – Code kostenlos kopieren & einfügen";

const FW_LABEL: Record<string, string> = {
  html: "HTML", css: "CSS", tailwind: "Tailwind", react: "React", vue: "Vue", svelte: "Svelte",
};

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await fetchComponent(slug);

  const title = c?.title ?? "Komponente";
  const author = c?.author ?? "elementa";
  const framework = FW_LABEL[c?.framework ?? "html"] ?? "HTML";
  const category = CATEGORIES.find((x) => x.slug === c?.category)?.label ?? "Komponente";
  const likes = c?.likes ?? 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0c",
          padding: 72,
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* warmer Glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(600px circle at 82% 6%, rgba(139,92,246,0.35), transparent 60%), radial-gradient(500px circle at 8% 100%, rgba(6,182,212,0.22), transparent 60%)",
            display: "flex",
          }}
        />

        {/* Kopf: Logo + Wortmarke */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 7,
              width: 66,
              height: 66,
              borderRadius: 19,
              paddingLeft: 16,
              background: "linear-gradient(135deg, #8b5cf6, #d946ef 50%, #06b6d4)",
            }}
          >
            <div style={{ width: 34, height: 7.5, borderRadius: 4, background: "#0b0b0e" }} />
            <div style={{ width: 21, height: 7.5, borderRadius: 4, background: "#0b0b0e" }} />
            <div style={{ width: 28, height: 7.5, borderRadius: 4, background: "#0b0b0e" }} />
          </div>
          <div style={{ fontSize: 38, fontWeight: 800, color: "#f3f1ea", letterSpacing: -1 }}>
            Elementa
          </div>
        </div>

        {/* Mitte: Kategorie + Titel + CTA */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", fontSize: 26, color: "#a78bfa", fontWeight: 600 }}>
            {category}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: title.length > 32 ? 72 : 88,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: -2,
              lineHeight: 1.05,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          <div style={{ display: "flex", marginTop: 6 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "linear-gradient(120deg, #8b5cf6, #d946ef 50%, #06b6d4)",
                color: "#ffffff",
                fontSize: 27,
                fontWeight: 700,
                padding: "12px 26px",
                borderRadius: 14,
              }}
            >
              Code kopieren &amp; einfügen  →
            </div>
          </div>
        </div>

        {/* Fuß: Autor · Framework · Likes */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 30, color: "#a6a29a" }}>
            <div style={{ display: "flex" }}>@{author}</div>
            <div style={{ display: "flex", color: "#6d6a62" }}>·</div>
            <div
              style={{
                display: "flex",
                padding: "6px 18px",
                borderRadius: 999,
                border: "1px solid #2a2730",
                color: "#f3f1ea",
                fontSize: 26,
              }}
            >
              {framework}
            </div>
            <div style={{ display: "flex", color: "#6d6a62" }}>·</div>
            <div style={{ display: "flex", color: "#ff8ba0" }}>♥ {likes}</div>
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#6d6a62" }}>
            it-handwerk-stuttgart.de
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
