import { NextResponse } from "next/server";
import { Client, Databases, Account, Query } from "node-appwrite";

/**
 * T4 — Admin-Moderation: Meldungen (reports) auflisten und bearbeiten.
 * Zugriff nur für Admins: der Client sendet ein kurzlebiges Appwrite-JWT
 * (account.createJWT) im Authorization-Header; der Server prüft damit die
 * Identität und das "admin"-Label. Gelesen/geändert wird mit dem API-Key.
 */
export const runtime = "nodejs";

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT!;
const DB = "marketplace";

function keyClient() {
  const key = process.env.APPWRITE_API_KEY;
  if (!key) return null;
  return new Databases(new Client().setEndpoint(ENDPOINT).setProject(PROJECT).setKey(key));
}

// JWT prüfen → true, wenn der Aufrufer Admin ist.
async function requireAdmin(req: Request): Promise<boolean> {
  const auth = req.headers.get("authorization") || "";
  const jwt = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!jwt) return false;
  try {
    const account = new Account(new Client().setEndpoint(ENDPOINT).setProject(PROJECT).setJWT(jwt));
    const me = await account.get();
    return (me.labels || []).includes("admin");
  } catch {
    return false;
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function GET(req: Request) {
  if (!(await requireAdmin(req))) return NextResponse.json({ ok: false, error: "Kein Zugriff." }, { status: 403 });
  const db = keyClient();
  if (!db) return NextResponse.json({ ok: false, error: "Nicht konfiguriert." }, { status: 503 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "open";
  const list = await db.listDocuments(DB, "reports", [
    Query.equal("status", status),
    Query.orderDesc("createdAt"),
    Query.limit(100),
  ]);

  // Meldungen mit dem gemeldeten Inhalt anreichern (Vorschau für die Moderation).
  const reports = await Promise.all(
    list.documents.map(async (r: any) => {
      let preview = "";
      let targetUrl = "";
      try {
        if (r.targetType === "comment") {
          const c = await db.getDocument(DB, "comments", r.targetId);
          preview = (c as any).body || "";
          // Slug der Komponente für den Direktlink nachschlagen
          try {
            const comp = await db.getDocument(DB, "components", (c as any).componentId);
            targetUrl = `/c/${(comp as any).slug || ""}`;
          } catch {
            /* Komponente evtl. gelöscht */
          }
        } else if (r.targetType === "component") {
          const c = await db.getDocument(DB, "components", r.targetId);
          preview = (c as any).title || "";
          targetUrl = `/c/${(c as any).slug || ""}`;
        }
      } catch {
        preview = "(Inhalt bereits gelöscht)";
      }
      return {
        id: r.$id,
        targetType: r.targetType,
        targetId: r.targetId,
        reason: r.reason,
        details: r.details || "",
        reporterName: r.reporterName || "anon",
        status: r.status,
        createdAt: r.createdAt || r.$createdAt,
        preview,
        targetUrl,
      };
    }),
  );
  return NextResponse.json({ ok: true, reports });
}

// Status ändern (resolved | dismissed)
export async function PATCH(req: Request) {
  if (!(await requireAdmin(req))) return NextResponse.json({ ok: false, error: "Kein Zugriff." }, { status: 403 });
  const db = keyClient();
  if (!db) return NextResponse.json({ ok: false, error: "Nicht konfiguriert." }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const id = String(body?.id || "");
  const status = String(body?.status || "");
  if (!id || !["open", "resolved", "dismissed"].includes(status)) {
    return NextResponse.json({ ok: false, error: "Ungültige Eingabe." }, { status: 400 });
  }
  await db.updateDocument(DB, "reports", id, { status });
  return NextResponse.json({ ok: true });
}

// Gemeldeten Inhalt löschen + Meldung als "resolved" markieren
export async function POST(req: Request) {
  if (!(await requireAdmin(req))) return NextResponse.json({ ok: false, error: "Kein Zugriff." }, { status: 403 });
  const db = keyClient();
  if (!db) return NextResponse.json({ ok: false, error: "Nicht konfiguriert." }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const id = String(body?.id || "");
  const targetType = String(body?.targetType || "");
  const targetId = String(body?.targetId || "");
  if (!id || !["comment", "component"].includes(targetType) || !targetId) {
    return NextResponse.json({ ok: false, error: "Ungültige Eingabe." }, { status: 400 });
  }
  const col = targetType === "comment" ? "comments" : "components";
  try {
    await db.deleteDocument(DB, col, targetId);
  } catch {
    /* evtl. schon gelöscht — trotzdem Meldung schließen */
  }
  await db.updateDocument(DB, "reports", id, { status: "resolved" });
  return NextResponse.json({ ok: true });
}
