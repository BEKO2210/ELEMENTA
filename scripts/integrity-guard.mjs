/**
 * Integritäts-Guard (Audit-Task T1): schützt die Vertrauens-Signale der Plattform.
 *
 * Problem: Eingeloggte Nutzer können per direkter API Komponenten mit gefälschtem
 * a11y:"pass" (WCAG-Badge!) oder likesCount anlegen/ändern — Appwrite kann einzelne
 * Attribute nicht schützen.
 *
 * Lösung (Cron alle 10 Minuten):
 *  1. a11y darf nur, was der letzte ECHTE axe-Audit (a11y-report.json) bescheinigt —
 *     und nur solange der Code (framework+html+css+js) exakt dem auditierten Stand
 *     entspricht (SHA-256-Hash). Unbekannte/abweichende/nachträglich geänderte
 *     Komponenten → "unchecked", bis der nächtliche Audit sie echt zertifiziert.
 *  2. likesCount wird aus der likes-Collection neu berechnet (Anzeige nutzt ohnehin
 *     echte Zählung — das Feld soll trotzdem nicht lügen).
 *  3. views wird auf 0 erzwungen (nichts inkrementiert es legitim; Analytics laufen
 *     über die privaten pageviews_daily-Collections).
 *
 * Key wird aus .env.local gelesen (server-only) — kein Secret im Crontab.
 * Start:  node scripts/integrity-guard.mjs [--dry]
 */
import { Client, Databases, Query } from "node-appwrite";
import { createHash } from "crypto";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry");

function env(name) {
  if (process.env[name]) return process.env[name];
  try {
    const m = readFileSync(join(ROOT, ".env.local"), "utf8").match(new RegExp(`^${name}=(.+)$`, "m"));
    return m?.[1]?.trim();
  } catch { return undefined; }
}

const apiKey = env("APPWRITE_API_KEY");
if (!apiKey) { console.error("❌ APPWRITE_API_KEY fehlt (env oder .env.local)."); process.exit(1); }

const db = new Databases(
  new Client()
    .setEndpoint(env("NEXT_PUBLIC_APPWRITE_ENDPOINT") ?? "https://appwrite.it-handwerk-stuttgart.de/v1")
    .setProject(env("NEXT_PUBLIC_APPWRITE_PROJECT") ?? "6a4453770009b9e7f029")
    .setKey(apiKey),
);

// Baseline: was der letzte echte axe-Audit bescheinigt hat (slug → {status, hash}).
// Einträge ohne Hash (altes Report-Format) zählen nicht als Zertifikat.
let baseline = new Map();
try {
  const report = JSON.parse(readFileSync(join(ROOT, "a11y-report.json"), "utf8"));
  baseline = new Map(
    report
      .filter((r) => (r.status === "pass" || r.status === "warn") && r.hash)
      .map((r) => [r.slug, { status: r.status, hash: r.hash }]),
  );
  if (report.some((r) => (r.status === "pass" || r.status === "warn") && !r.hash))
    console.warn("⚠ Report enthält Einträge ohne Code-Hash (altes Format) — diese gelten als unzertifiziert.");
} catch {
  console.warn("⚠ a11y-report.json fehlt — ALLE pass/warn-Werte werden zurückgesetzt.");
}

// Muss exakt der Hash-Bildung in a11y-audit.mjs entsprechen
const codeHash = (doc) =>
  createHash("sha256")
    .update([doc.framework, doc.html || "", doc.css || "", doc.js || ""].join("\u0000"))
    .digest("hex");

async function listAll(collection, queries = []) {
  const out = [];
  let cursor = null;
  for (;;) {
    const q = [...queries, Query.limit(100)];
    if (cursor) q.push(Query.cursorAfter(cursor));
    const { documents } = await db.listDocuments("marketplace", collection, q);
    out.push(...documents);
    if (documents.length < 100) break;
    cursor = documents[documents.length - 1].$id;
  }
  return out;
}

const [components, likes] = await Promise.all([listAll("components"), listAll("likes")]);

// echte Like-Zählung pro componentId (Dokument-ID der Komponente)
const likeCount = new Map();
for (const l of likes) likeCount.set(l.componentId, (likeCount.get(l.componentId) ?? 0) + 1);

let fixed = 0;
for (const doc of components) {
  const patch = {};

  // 1) a11y: nur Audit-bescheinigte Werte dürfen stehen bleiben — und nur,
  // wenn der Code seit dem Audit unverändert ist. Neue Uploads und nachträglich
  // geänderte Komponenten bleiben "unchecked", bis der nächtliche axe-Audit
  // sie echt zertifiziert.
  const entry = baseline.get(doc.slug);
  const certified = entry && entry.hash === codeHash(doc) ? entry.status : "unchecked";
  if (doc.a11y !== certified) patch.a11y = certified;

  // 2) likesCount: echte Zählung
  const real = likeCount.get(doc.$id) ?? 0;
  if (doc.likesCount !== real) patch.likesCount = real;

  // 3) views: wird von nichts legitim beschrieben → 0 erzwingen
  if (doc.views !== 0) patch.views = 0;

  if (Object.keys(patch).length) {
    fixed++;
    console.log(`${DRY ? "[dry] " : ""}⛨ ${doc.slug}: ${JSON.stringify({ vorher: { a11y: doc.a11y, likesCount: doc.likesCount, views: doc.views }, patch })}`);
    if (!DRY) await db.updateDocument("marketplace", "components", doc.$id, patch);
  }
}
console.log(`Guard fertig — ${components.length} geprüft, ${fixed} korrigiert${DRY ? " (dry)" : ""}.`);
