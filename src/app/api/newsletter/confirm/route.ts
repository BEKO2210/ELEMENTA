import { NextResponse } from "next/server";
import { Client, Databases } from "node-appwrite";
import { siteUrl } from "@/lib/mail";

/**
 * Bestätigt eine Newsletter-Anmeldung (Double-Opt-in, T5).
 * Prüft id + token, setzt confirmedAt und entfernt den Token.
 * Leitet auf eine freundliche Bestätigungsseite weiter.
 */
export const runtime = "nodejs";

const DB = "marketplace";
const COL = "newsletter";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id") || "";
  const token = url.searchParams.get("token") || "";
  const dest = (state: string) => NextResponse.redirect(`${siteUrl()}/newsletter/bestaetigt?state=${state}`);

  if (!id || !token || !process.env.APPWRITE_API_KEY) return dest("error");

  const db = new Databases(
    new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
      .setKey(process.env.APPWRITE_API_KEY),
  );

  try {
    const doc = (await db.getDocument(DB, COL, id)) as { confirmedAt?: string | null; token?: string | null };
    if (doc.confirmedAt) return dest("already"); // schon bestätigt
    if (!doc.token || doc.token !== token) return dest("invalid");
    await db.updateDocument(DB, COL, id, { confirmedAt: new Date().toISOString(), token: null });
    return dest("ok");
  } catch {
    return dest("invalid");
  }
}
