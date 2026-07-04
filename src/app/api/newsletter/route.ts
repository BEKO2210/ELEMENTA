import { NextResponse } from "next/server";
import { Client, Databases, ID } from "node-appwrite";

/**
 * Newsletter-Anmeldung: speichert die E-Mail serverseitig in einer PRIVATEN
 * Appwrite-Collection (nur API-Key, kein öffentlicher Lesezugriff).
 * Double-Opt-in-Versand kann später ergänzt werden — bis dahin ist die
 * Speicherung die ehrliche Grundlage („wir melden uns bei Neuigkeiten").
 */
export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase().slice(0, 320) : "";
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ ok: false, error: "Ungültige E-Mail-Adresse." }, { status: 400 });
    }
    const key = process.env.APPWRITE_API_KEY;
    if (!key) return NextResponse.json({ ok: false, error: "Derzeit nicht verfügbar." }, { status: 503 });

    const db = new Databases(
      new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
        .setKey(key),
    );
    try {
      await db.createDocument("marketplace", "newsletter", ID.unique(), {
        email,
        consentAt: new Date().toISOString(),
      });
    } catch (e: unknown) {
      // Unique-Index: bereits angemeldet → für den Nutzer trotzdem Erfolg (idempotent)
      const code = (e as { code?: number })?.code;
      if (code !== 409) throw e;
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Anmeldung derzeit nicht möglich." }, { status: 500 });
  }
}
