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

/** Alle Komponenten (nach Likes sortiert). Fällt bei Fehler/leerer DB auf Mock zurück. */
export async function fetchComponents(): Promise<UIComponent[]> {
  try {
    const r = await databases().listDocuments(DB_ID, COL_COMPONENTS, [
      Query.orderDesc("createdAt"),
      Query.limit(100),
    ]);
    return r.documents.length ? r.documents.map(mapDoc) : MOCK;
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
    const r = await databases().listDocuments(DB_ID, COL_COMPONENTS, [
      Query.equal("authorId", authorId),
      Query.orderDesc("createdAt"),
      Query.limit(100),
    ]);
    return r.documents.map(mapDoc);
  } catch {
    return [];
  }
}

export async function fetchByAuthor(username: string): Promise<UIComponent[]> {
  try {
    const r = await databases().listDocuments(DB_ID, COL_COMPONENTS, [
      Query.equal("authorUsername", username),
      Query.orderDesc("createdAt"),
      Query.limit(60),
    ]);
    return r.documents.map(mapDoc);
  } catch {
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
    const ids = components.map((c) => c.id);
    const r = await databases().listDocuments(DB_ID, COL_LIKES, [
      Query.equal("componentId", ids),
      Query.limit(2000),
    ]);
    const counts: Record<string, number> = {};
    for (const d of r.documents) {
      const cid = (d as unknown as { componentId: string }).componentId;
      counts[cid] = (counts[cid] || 0) + 1;
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
    const r = await databases().listDocuments(DB_ID, COL_COMPONENTS, [Query.limit(200)]);
    if (r.documents.length) return r.documents.map((d: any) => d.slug);
  } catch {
    /* fall through */
  }
  return MOCK.map((c) => c.slug);
}
