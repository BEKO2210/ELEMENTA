import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { Client, Databases, ID, Query } from "node-appwrite";
import { sendMail, mailConfigured, siteUrl } from "@/lib/mail";

/**
 * Newsletter-Anmeldung mit DOUBLE-OPT-IN (T5).
 * 1) E-Mail speichern (confirmedAt=null, Token setzen) in privater Collection.
 * 2) Bestätigungs-Mail mit Confirm-Link senden.
 * Ohne konfiguriertes SMTP wird NICHT „Erfolg" vorgetäuscht (Wahrheitsregel):
 * die Anmeldung wird zurückgerollt und ein ehrlicher Fehler zurückgegeben.
 * Unbestätigte Einträge löscht der Cron nach 30 Tagen (scripts/newsletter-cleanup.mjs).
 */
export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
const DB = "marketplace";
const COL = "newsletter";

function db() {
  return new Databases(
    new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
      .setKey(process.env.APPWRITE_API_KEY!),
  );
}

function confirmMail(link: string) {
  const text = `Danke für dein Interesse an Elementa!

Bitte bestätige deine Newsletter-Anmeldung mit diesem Link:
${link}

Wenn du das nicht warst, ignoriere diese E-Mail einfach — ohne Bestätigung senden wir dir nichts und löschen die Adresse nach 30 Tagen.`;
  const html = `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto">
    <h2 style="color:#8b5cf6">Fast geschafft ✨</h2>
    <p>Danke für dein Interesse an <strong>Elementa</strong>! Bitte bestätige deine Newsletter-Anmeldung:</p>
    <p><a href="${link}" style="display:inline-block;background:#8b5cf6;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px">Anmeldung bestätigen</a></p>
    <p style="color:#666;font-size:13px">Wenn du das nicht warst, ignoriere diese E-Mail. Ohne Bestätigung senden wir dir nichts und löschen die Adresse nach 30 Tagen.</p>
  </div>`;
  return { text, html };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase().slice(0, 320) : "";
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ ok: false, error: "Ungültige E-Mail-Adresse." }, { status: 400 });
    }
    if (!process.env.APPWRITE_API_KEY) {
      return NextResponse.json({ ok: false, error: "Derzeit nicht verfügbar." }, { status: 503 });
    }
    // Kein stiller Fake-Erfolg, wenn wir gar keine Mail senden können.
    if (!mailConfigured()) {
      return NextResponse.json({ ok: false, error: "Newsletter-Versand ist derzeit nicht eingerichtet." }, { status: 503 });
    }

    const database = db();
    const token = randomBytes(24).toString("hex");
    const now = new Date().toISOString();

    // Bereits vorhanden? (Unique-Index auf email)
    const existing = await database.listDocuments(DB, COL, [Query.equal("email", email), Query.limit(1)]);
    let docId: string;
    if (existing.total > 0) {
      const doc = existing.documents[0] as { $id: string; confirmedAt?: string | null };
      if (doc.confirmedAt) {
        // Schon bestätigt → idempotenter Erfolg, keine neue Mail.
        return NextResponse.json({ ok: true, already: true });
      }
      // Unbestätigt → neuen Token + neue Bestätigungsmail.
      docId = doc.$id;
      await database.updateDocument(DB, COL, docId, { token, consentAt: now });
    } else {
      const doc = await database.createDocument(DB, COL, ID.unique(), {
        email,
        consentAt: now,
        confirmedAt: null,
        token,
      });
      docId = doc.$id;
    }

    const link = `${siteUrl()}/api/newsletter/confirm?id=${docId}&token=${token}`;
    const { text, html } = confirmMail(link);
    try {
      await sendMail({ to: email, subject: "Bitte bestätige deine Newsletter-Anmeldung", text, html });
    } catch {
      // Versand fehlgeschlagen → neu angelegten Eintrag zurückrollen (keine Karteileiche).
      if (existing.total === 0) await database.deleteDocument(DB, COL, docId).catch(() => {});
      return NextResponse.json({ ok: false, error: "Bestätigungs-Mail konnte nicht gesendet werden." }, { status: 502 });
    }

    return NextResponse.json({ ok: true, pending: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Anmeldung derzeit nicht möglich." }, { status: 500 });
  }
}
