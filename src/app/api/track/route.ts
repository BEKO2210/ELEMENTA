import { NextResponse } from "next/server";

/**
 * First-Party-Pageview-Endpunkt (EU-gehostet, keine Dritt-Anbieter).
 *
 * Bewusst datensparsam: wir speichern KEINE IP-Adresse und keine personenbezogenen
 * Kennungen. Der Beacon wird serverseitig gezählt/geloggt. Eine Aggregation in eine
 * Datenbank (z. B. Appwrite) kann hier später ergänzt werden.
 *
 * Der Aufruf erfolgt nur nach Einwilligung (siehe components/Analytics.tsx).
 */
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const path = typeof body?.path === "string" ? body.path.slice(0, 200) : "unknown";
    // Referrer defensiv auf den reinen Hostnamen reduzieren — keine Query-Parameter/Pfade
    // (die Tokens/IDs enthalten könnten) speichern.
    let ref: string | null = null;
    if (typeof body?.ref === "string" && body.ref) {
      try {
        ref = new URL(body.ref).hostname;
      } catch {
        ref = body.ref.replace(/[/?#].*$/, "").slice(0, 120);
      }
    }

    // Datensparsame Zählung — keine IP, kein User-Agent-Fingerprinting.
    console.log(`[analytics] pageview path=${path}${ref ? ` ref=${ref}` : ""}`);

    // 204: kein Body nötig, minimaler Overhead für den Beacon.
    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
