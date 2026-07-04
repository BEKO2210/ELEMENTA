import "server-only";
import { Client, Databases, Query, ID } from "node-appwrite";
import { createHash } from "crypto";

/**
 * Serverseitige Analytik (datensparsam): tägliche Aggregate statt Roh-Events.
 * Kein IP-Logging, keine User-Kennungen — nur (Tag, Pfad, Zähler) bzw.
 * (Tag, Referrer-Host, Zähler). Collections sind privat (nur API-Key).
 */

const DB = "marketplace";
const PAGEVIEWS = "pageviews_daily";
const REFS = "refs_daily";

function getDb(): Databases | null {
  const key = process.env.APPWRITE_API_KEY;
  if (!key) return null; // Analytik ist optional — nie die App gefährden
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
    .setKey(key);
  return new Databases(client);
}

/** Heutiges Datum (UTC) als YYYY-MM-DD — stabil über Serverneustarts. */
export function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Deterministische Doc-ID → atomarer Upsert pro (Tag, Schlüssel). */
function dailyId(day: string, key: string): string {
  return `${day.replaceAll("-", "")}-${createHash("sha256").update(key).digest("hex").slice(0, 20)}`;
}

async function bump(db: Databases, collection: string, day: string, fields: Record<string, string>) {
  const docId = dailyId(day, Object.values(fields).join("|"));
  try {
    await db.incrementDocumentAttribute(DB, collection, docId, "count", 1);
  } catch {
    // Dokument existiert noch nicht → anlegen; Konflikt-Race → erneut inkrementieren
    try {
      await db.createDocument(DB, collection, docId, { day, ...fields, count: 1 });
    } catch {
      await db.incrementDocumentAttribute(DB, collection, docId, "count", 1).catch(() => {});
    }
  }
}

/** Zählt einen Pageview (Fire-and-forget aus /api/track). */
export async function recordPageview(path: string, refHost: string | null): Promise<void> {
  const db = getDb();
  if (!db) return;
  const day = todayUtc();
  await bump(db, PAGEVIEWS, day, { path });
  if (refHost) await bump(db, REFS, day, { host: refHost });
}

export interface DayCount { day: string; count: number }
export interface StatsSummary {
  days: DayCount[];            // lückenlos, ältester zuerst (30 Einträge)
  today: number;
  last7: number;
  last30: number;
  topPaths: { path: string; count: number }[];
  topRefs: { host: string; count: number }[];
}

async function listAll(db: Databases, collection: string, cutoff: string) {
  const out: Record<string, unknown>[] = [];
  let cursor: string | null = null;
  for (let i = 0; i < 30; i++) { // Sicherheitsdeckel: max 3000 Docs
    const queries = [Query.greaterThanEqual("day", cutoff), Query.limit(100)];
    if (cursor) queries.push(Query.cursorAfter(cursor));
    const { documents } = await db.listDocuments(DB, collection, queries);
    out.push(...documents);
    if (documents.length < 100) break;
    cursor = (documents[documents.length - 1] as { $id: string }).$id;
  }
  return out;
}

/** Aggregierte Kennzahlen der letzten 30 Tage für /stats. */
export async function fetchStats(): Promise<StatsSummary | null> {
  const db = getDb();
  if (!db) return null;

  const now = new Date();
  const cutoff = new Date(now.getTime() - 29 * 86400_000).toISOString().slice(0, 10);
  const week = new Date(now.getTime() - 6 * 86400_000).toISOString().slice(0, 10);
  const today = todayUtc();

  const [views, refs] = await Promise.all([
    listAll(db, PAGEVIEWS, cutoff),
    listAll(db, REFS, cutoff),
  ]);

  const perDay = new Map<string, number>();
  const perPath = new Map<string, number>();
  for (const d of views as { day: string; path: string; count: number }[]) {
    perDay.set(d.day, (perDay.get(d.day) ?? 0) + d.count);
    perPath.set(d.path, (perPath.get(d.path) ?? 0) + d.count);
  }
  const perRef = new Map<string, number>();
  for (const d of refs as { host: string; count: number }[]) {
    perRef.set(d.host, (perRef.get(d.host) ?? 0) + d.count);
  }

  // Lückenlose 30-Tage-Reihe (Tage ohne Traffic = 0)
  const days: DayCount[] = [];
  for (let i = 29; i >= 0; i--) {
    const day = new Date(now.getTime() - i * 86400_000).toISOString().slice(0, 10);
    days.push({ day, count: perDay.get(day) ?? 0 });
  }

  const top = <K extends string>(m: Map<K, number>, n: number) =>
    [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);

  return {
    days,
    today: perDay.get(today) ?? 0,
    last7: days.filter((d) => d.day >= week).reduce((s, d) => s + d.count, 0),
    last30: days.reduce((s, d) => s + d.count, 0),
    topPaths: top(perPath, 10).map(([path, count]) => ({ path, count })),
    topRefs: top(perRef, 8).map(([host, count]) => ({ host, count })),
  };
}
