import { NextResponse } from "next/server";
import { recordPageview } from "@/lib/analytics-server";

/**
 * First-Party-Pageview-Endpunkt (EU-gehostet, keine Dritt-Anbieter).
 *
 * Bewusst datensparsam: KEINE IP-Adresse, kein User-Agent-Fingerprinting,
 * keine personenbezogenen Kennungen. Gespeichert werden ausschließlich
 * tägliche Aggregate (Tag + Pfad + Zähler bzw. Tag + Referrer-Host + Zähler)
 * in privaten Appwrite-Collections — sichtbar auf /stats.
 *
 * Der Aufruf erfolgt nur nach Einwilligung (siehe components/Analytics.tsx).
 */
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const path = typeof body?.path === "string" ? body.path.slice(0, 200) : "unknown";
    // Referrer defensiv auf den reinen Hostnamen reduzieren — keine Query-Parameter/Pfade
    // (die Tokens/IDs enthalten könnten) speichern. Eigene Domain zählt nicht als Referrer.
    let ref: string | null = null;
    if (typeof body?.ref === "string" && body.ref) {
      try {
        ref = new URL(body.ref.includes("://") ? body.ref : `https://${body.ref}`).hostname;
      } catch {
        ref = body.ref.replace(/[/?#].*$/, "").slice(0, 120);
      }
      if (ref === "ui.it-handwerk-stuttgart.de") ref = null;
    }

    // Fire-and-forget: Analytik darf die Antwortzeit nicht beeinflussen und
    // Fehler dürfen niemals nach außen schlagen.
    recordPageview(path, ref).catch(() => {});

    // 204: kein Body nötig, minimaler Overhead für den Beacon.
    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
