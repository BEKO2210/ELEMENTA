/**
 * E2E-Test für den Integritäts-Guard (Audit-Task T1 / Befund C2).
 *
 * Stellt den Angriff aus dem Audit nach: Ein regulärer (Wegwerf-)Nutzer legt per
 * direkter API eine Komponente mit gefälschtem a11y:"pass", likesCount:424242 und
 * views:999999 an. Danach läuft der Guard — und muss alle drei Felder zurücksetzen.
 *
 * Zusätzlich: Code-Manipulation einer zertifizierten Komponente wird simuliert,
 * indem geprüft wird, dass der Guard den Badge-Erhalt an den Code-Hash bindet
 * (Fake-Komponente übernimmt den Slug NICHT, daher reicht der Fake-Fall).
 *
 * Der Wegwerf-Account und alle Testdaten werden am Ende vollständig gelöscht.
 *
 * Start: node scripts/test-integrity.mjs
 */
import { execFileSync } from "child_process";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Client, Databases, Users, Query } from "node-appwrite";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function env(name) {
  if (process.env[name]) return process.env[name];
  try {
    const m = readFileSync(join(ROOT, ".env.local"), "utf8").match(new RegExp(`^${name}=(.+)$`, "m"));
    return m?.[1]?.trim();
  } catch { return undefined; }
}

const ENDPOINT = env("NEXT_PUBLIC_APPWRITE_ENDPOINT") ?? "https://appwrite.it-handwerk-stuttgart.de/v1";
const PROJECT = env("NEXT_PUBLIC_APPWRITE_PROJECT") ?? "6a4453770009b9e7f029";
const API_KEY = env("APPWRITE_API_KEY");
if (!API_KEY) { console.error("❌ APPWRITE_API_KEY fehlt."); process.exit(1); }

const adminClient = new Client().setEndpoint(ENDPOINT).setProject(PROJECT).setKey(API_KEY);
const adminDb = new Databases(adminClient);
const adminUsers = new Users(adminClient);

const stamp = Date.now().toString(36);
const email = `integrity-test-${stamp}@example.com`;
const password = `Tt1!${stamp}${stamp}`;
const userId = `itest${stamp}`.slice(0, 36);
const slug = `integrity-test-${stamp}`;

let docId = null;
let failures = 0;
const check = (ok, label) => {
  console.log(`${ok ? "✓" : "✗ FEHLER:"} ${label}`);
  if (!ok) failures++;
};

// REST-Helfer: agiert als normaler Browser-Client (Session-Cookie, kein API-Key)
let cookie = "";
async function rest(method, path, body) {
  const res = await fetch(`${ENDPOINT}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Appwrite-Project": PROJECT,
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const setCookie = res.headers.getSetCookie?.() ?? [];
  if (setCookie.length) cookie = setCookie.map((c) => c.split(";")[0]).join("; ");
  let json = null;
  try { json = await res.json(); } catch { /* leer */ }
  return { status: res.status, json };
}

try {
  // 1) Wegwerf-Account anlegen + Session (wie ein echter Angreifer über die öffentliche API)
  const reg = await rest("POST", "/account", { userId, email, password, name: "Integrity Test" });
  check(reg.status === 201, `Registrierung (${reg.status})`);
  const session = await rest("POST", "/account/sessions/email", { email, password });
  check(session.status === 201, `Login (${session.status})`);

  // 2) Angriff: Komponente mit gefälschten Vertrauens-Signalen anlegen
  const attack = await rest("POST", "/databases/marketplace/collections/components/documents", {
    documentId: "unique()",
    data: {
      title: "Integrity Test (bitte löschen)",
      slug,
      description: "Automatischer Guard-Test — wird sofort wieder gelöscht.",
      html: "<button>Test</button>",
      css: "button{color:#fff}",
      framework: "html",
      category: "buttons",
      authorId: userId,
      authorUsername: "integrity-test",
      a11y: "pass",          // ← gefälschtes WCAG-Badge
      likesCount: 424242,     // ← gefälschte Likes
      views: 999999,          // ← gefälschte Views
      createdAt: new Date().toISOString(),
    },
    permissions: [`read("any")`, `update("user:${userId}")`, `delete("user:${userId}")`],
  });
  check(attack.status === 201, `Angriff: Fake-Komponente angelegt (${attack.status})`);
  docId = attack.json?.$id ?? null;
  check(attack.json?.a11y === "pass", `Vor Guard: a11y steht auf "${attack.json?.a11y}" (Angriff erfolgreich, wie in Audit C2)`);

  // 3) Guard laufen lassen
  console.log("\n— Guard läuft —");
  console.log(execFileSync(process.execPath, [join(ROOT, "scripts/integrity-guard.mjs")], { encoding: "utf8" }).trim());
  console.log("—\n");

  // 4) Nachher: Felder müssen zurückgesetzt sein (öffentliche Lesesicht)
  const after = await adminDb.getDocument("marketplace", "components", docId);
  check(after.a11y === "unchecked", `Nach Guard: a11y = "${after.a11y}" (erwartet "unchecked" → Badge zeigt "A11y prüfen")`);
  check(after.likesCount === 0, `Nach Guard: likesCount = ${after.likesCount} (erwartet 0)`);
  check(after.views === 0, `Nach Guard: views = ${after.views} (erwartet 0)`);

  // 5) Code-Hash-Bindung: zertifizierte Komponente manipulieren → Badge muss fallen.
  // Wir nehmen eine echte pass-Komponente, hängen ein Zeichen an ihr CSS, lassen den
  // Guard laufen und stellen danach ALLES exakt wieder her.
  const report = JSON.parse(readFileSync(join(ROOT, "a11y-report.json"), "utf8"));
  const certified = report.find((r) => r.status === "pass" && r.hash);
  if (certified) {
    const { documents } = await adminDb.listDocuments("marketplace", "components", [
      Query.equal("slug", certified.slug),
      Query.limit(1),
    ]);
    const target = documents[0] ?? null;
    if (target) {
      const originalCss = target.css;
      const originalA11y = target.a11y;
      await adminDb.updateDocument("marketplace", "components", target.$id, { css: (originalCss || "") + "/*x*/" });
      execFileSync(process.execPath, [join(ROOT, "scripts/integrity-guard.mjs")], { encoding: "utf8" });
      const tampered = await adminDb.getDocument("marketplace", "components", target.$id);
      check(tampered.a11y === "unchecked", `Code-Manipulation an "${target.slug}": Badge fällt auf "unchecked"`);
      // Wiederherstellen (Code zurück, Guard setzt a11y beim nächsten Lauf wieder auf den Audit-Wert)
      await adminDb.updateDocument("marketplace", "components", target.$id, { css: originalCss, a11y: originalA11y });
      const restored = await adminDb.getDocument("marketplace", "components", target.$id);
      check(restored.css === originalCss && restored.a11y === originalA11y, `"${target.slug}" vollständig wiederhergestellt`);
    } else {
      console.log("⚠ Zertifizierte Komponente nicht in DB gefunden — Hash-Test übersprungen.");
    }
  } else {
    console.log("⚠ Kein pass-Eintrag mit Hash im Report — Hash-Test übersprungen (Report neu generieren).");
  }
} finally {
  // 6) Aufräumen: Testdokument + Wegwerf-Account restlos löschen
  if (docId) {
    try { await adminDb.deleteDocument("marketplace", "components", docId); console.log("🧹 Test-Komponente gelöscht."); }
    catch (e) { console.error("⚠ Konnte Test-Komponente nicht löschen:", e.message); failures++; }
  }
  try { await adminUsers.delete(userId); console.log("🧹 Wegwerf-Account gelöscht."); }
  catch (e) { console.error("⚠ Konnte Wegwerf-Account nicht löschen:", e.message); failures++; }
}

console.log(failures === 0 ? "\n=== ✅ T1-Integritätstest bestanden ===" : `\n=== ❌ ${failures} Prüfung(en) fehlgeschlagen ===`);
process.exit(failures === 0 ? 0 : 1);
