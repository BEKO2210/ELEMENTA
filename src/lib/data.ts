import { Query } from "appwrite";
import { databases, DB_ID, COL_COMPONENTS, COL_LIKES } from "./appwrite";
import type { UIComponent } from "./types";
import { COMPONENTS as MOCK } from "./mock-data";

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapDoc(d: any): UIComponent {
  return {
    id: d.$id,
    slug: d.slug,
    title: d.title,
    description: d.description ?? "",
    framework: d.framework,
    category: d.category,
    tags: d.tags ?? [],
    html: d.html ?? "",
    css: d.css ?? "",
    js: d.js ?? "",
    author: d.authorUsername ?? d.authorId ?? "anon",
    authorId: d.authorId,
    likes: d.likesCount ?? 0,
    a11y: d.a11y ?? "unchecked",
    createdAt: d.createdAt ?? d.$createdAt,
  };
}

/**
 * Lädt ALLE passenden Komponenten-Dokumente per Cursor-Pagination — kein hartes
 * 60/100-Limit mehr, damit alle Ansichten (Home/Explore/Profil/öffentlich) dieselbe
 * vollständige Menge sehen und Like-Summen übereinstimmen.
 */
async function listAllComponents(filters: string[]): Promise<any[]> {
  const out: any[] = [];
  let cursor: string | null = null;
  // Sicherheitslimit gegen Endlosschleifen (bis 2000 Komponenten).
  for (let page = 0; page < 20; page++) {
    const queries = [...filters, Query.limit(100)];
    if (cursor) queries.push(Query.cursorAfter(cursor));
    const r = await databases().listDocuments(DB_ID, COL_COMPONENTS, queries);
    out.push(...r.documents);
    if (r.documents.length < 100) break;
    cursor = r.documents[r.documents.length - 1].$id;
  }
  return out;
}

/** Alle Komponenten (neueste zuerst). Fällt bei Fehler/leerer DB auf Mock zurück. */
export async function fetchComponents(): Promise<UIComponent[]> {
  try {
    const docs = await listAllComponents([Query.orderDesc("createdAt")]);
    return docs.length ? docs.map(mapDoc) : MOCK;
  } catch (e) {
    // Sichtbar machen: bei DB-Ausfall fallen wir auf Mock-Daten zurück (Betreiber-Signal).
    console.error("[data] fetchComponents failed, using mock fallback:", e);
    return MOCK;
  }
}

export async function fetchComponent(slug: string): Promise<UIComponent | undefined> {
  try {
    const r = await databases().listDocuments(DB_ID, COL_COMPONENTS, [
      Query.equal("slug", slug),
      Query.limit(1),
    ]);
    if (r.documents.length) return mapDoc(r.documents[0]);
  } catch {
    /* fall through to mock */
  }
  return MOCK.find((c) => c.slug === slug);
}

/** Komponenten eines Nutzers per stabiler authorId (für Dashboard/Verwaltung). Kein Mock-Fallback. */
export async function fetchByAuthorId(authorId: string): Promise<UIComponent[]> {
  try {
    const docs = await listAllComponents([Query.equal("authorId", authorId), Query.orderDesc("createdAt")]);
    return docs.map(mapDoc);
  } catch (e) {
    console.error("[data] fetchByAuthorId failed:", e);
    return [];
  }
}

export async function fetchByAuthor(username: string): Promise<UIComponent[]> {
  try {
    const docs = await listAllComponents([Query.equal("authorUsername", username), Query.orderDesc("createdAt")]);
    return docs.map(mapDoc);
  } catch (e) {
    console.error("[data] fetchByAuthor failed:", e);
    return MOCK.filter((c) => c.author === username);
  }
}

/**
 * Setzt `likes` auf die ECHTE Anzahl der Like-Dokumente je Komponente (ein Query
 * für alle). Keine erfundenen Basiswerte — nur echte Likes. Bei Fehler unverändert.
 */
export async function attachLikeCounts(components: UIComponent[]): Promise<UIComponent[]> {
  if (!components.length) return components;
  try {
    const counts: Record<string, number> = {};
    const ids = components.map((c) => c.id);
    // Appwrite begrenzt IN-Listen auf 100 Werte und listDocuments auf 100 Treffer/Seite.
    // Daher IDs in 100er-Batches abfragen und jede Seite per Cursor durchpaginieren —
    // korrekt für beliebig viele Komponenten und Likes.
    for (let i = 0; i < ids.length; i += 100) {
      const batch = ids.slice(i, i + 100);
      let cursor: string | null = null;
      for (;;) {
        const queries = [Query.equal("componentId", batch), Query.limit(100)];
        if (cursor) queries.push(Query.cursorAfter(cursor));
        const r = await databases().listDocuments(DB_ID, COL_LIKES, queries);
        for (const d of r.documents) {
          const cid = (d as unknown as { componentId: string }).componentId;
          counts[cid] = (counts[cid] || 0) + 1;
        }
        if (r.documents.length < 100) break;
        cursor = r.documents[r.documents.length - 1].$id;
      }
    }
    return components.map((c) => ({ ...c, likes: counts[c.id] || 0 }));
  } catch (e) {
    console.error("[data] attachLikeCounts failed:", e);
    return components;
  }
}

export interface SiteStats {
  /** Anzahl veröffentlichter Komponenten. */
  components: number;
  /** Einzigartige Autoren (Contributors). */
  contributors: number;
  /** Summe echter Likes über alle Komponenten. */
  likes: number;
  /** Anzahl unterstützter Frameworks (aus den Daten abgeleitet). */
  frameworks: number;
  /** Durchschnittliche Komponentengröße in KB (html+css+js, roh). */
  avgKb: number;
}

/**
 * Berechnet Kennzahlen aus einer bereits geladenen Komponentenliste — keine
 * erfundenen Werte, alles direkt aus den Daten abgeleitet.
 */
export function computeStats(components: UIComponent[]): SiteStats {
  const contributors = new Set(components.map((c) => c.author).filter(Boolean)).size;
  const likes = components.reduce((sum, c) => sum + (c.likes || 0), 0);
  const frameworks = new Set(components.map((c) => c.framework).filter(Boolean)).size;
  const totalBytes = components.reduce(
    (sum, c) => sum + c.html.length + c.css.length + c.js.length,
    0,
  );
  const avgKb = components.length
    ? Math.round((totalBytes / components.length / 1024) * 10) / 10
    : 0;
  return { components: components.length, contributors, likes, frameworks, avgKb };
}

export async function fetchSlugs(): Promise<string[]> {
  try {
    const docs = await listAllComponents([]);
    if (docs.length) return docs.map((d) => d.slug);
  } catch {
    /* fall through */
  }
  return MOCK.map((c) => c.slug);
}
