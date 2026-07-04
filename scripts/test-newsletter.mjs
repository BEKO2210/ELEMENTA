/**
 * T5-E2E: Double-Opt-in-Flow gegen einen lokalen SMTP-Catcher.
 * Erwartet einen laufenden Next-Server (Port 3000), der mit SMTP_HOST=localhost
 * SMTP_PORT=2525 und NEXT_PUBLIC_SITE_URL=http://localhost:3000 gestartet wurde.
 * Start: APPWRITE_API_KEY="<key>" node scripts/test-newsletter.mjs
 */
import { SMTPServer } from "smtp-server";
import { Client, Databases, Query } from "node-appwrite";

const BASE = "http://localhost:3000";
const DB = "marketplace";
const COL = "newsletter";
const db = new Databases(
  new Client().setEndpoint("https://appwrite.it-handwerk-stuttgart.de/v1").setProject("6a4453770009b9e7f029").setKey(process.env.APPWRITE_API_KEY),
);

let pass = 0, fail = 0;
const check = (ok, label) => { console.log(ok ? "  ✓" : "  ✗", label); ok ? pass++ : fail++; };
const email = `e2e-nl-${Date.now().toString(36)}@example.com`;
let received = "";

// 1) SMTP-Catcher starten (kein STARTTLS, jede Auth akzeptieren → wie ein Dev-Catcher)
const server = new SMTPServer({
  authOptional: true,
  hideSTARTTLS: true,
  disabledCommands: ["STARTTLS"],
  onAuth(auth, session, cb) { cb(null, { user: auth.username || "test" }); },
  onData(stream, session, cb) {
    let data = "";
    stream.on("data", (c) => (data += c));
    stream.on("end", () => { received = data; cb(); });
  },
});
await new Promise((res) => server.listen(2525, "127.0.0.1", res));

try {
  console.log("→ Anmeldung absenden (POST /api/newsletter)");
  const r = await fetch(`${BASE}/api/newsletter`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }),
  });
  const j = await r.json();
  check(r.status === 200 && j.pending === true, "Signup akzeptiert, Status 'pending'");

  console.log("→ auf Bestätigungs-Mail warten");
  for (let i = 0; i < 30 && !received; i++) await new Promise((res) => setTimeout(res, 200));
  check(Boolean(received), "Bestätigungs-Mail im Catcher angekommen");
  check(/Newsletter-Anmeldung/i.test(received) || /bestätige/i.test(received), "Mail hat Bestätigungs-Betreff/Inhalt");

  console.log("→ vor Bestätigung: confirmedAt ist null");
  const before = await db.listDocuments(DB, COL, [Query.equal("email", email), Query.limit(1)]);
  check(before.total === 1 && !before.documents[0].confirmedAt, "Eintrag existiert, unbestätigt");

  console.log("→ Confirm-Link aus der Mail extrahieren und aufrufen");
  // Quoted-Printable dekodieren: Soft-Breaks entfernen + =XX-Hex auflösen
  const clean = received
    .replace(/=\r?\n/g, "")
    .replace(/=([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  const m = clean.match(/https?:\/\/[^\s"'<>]+\/api\/newsletter\/confirm\?[^\s"'<>&]+&token=[^\s"'<>]+/);
  check(Boolean(m), "Confirm-Link in der Mail gefunden");
  // Der Link nutzt die (build-time eingebackene) Produktions-Domain — für den
  // lokalen Test auf localhost:3000 umbiegen (id + token bleiben identisch).
  const localLink = m[0].replace(/^https?:\/\/[^/]+/, BASE);
  const confirmRes = await fetch(localLink, { redirect: "manual" });
  const loc = confirmRes.headers.get("location") || "";
  check(confirmRes.status >= 300 && confirmRes.status < 400 && /state=ok/.test(loc), `Confirm → Redirect state=ok (HTTP ${confirmRes.status})`);

  console.log("→ nach Bestätigung: confirmedAt gesetzt, Token entfernt");
  const after = await db.getDocument(DB, COL, before.documents[0].$id);
  check(Boolean(after.confirmedAt) && !after.token, "confirmedAt gesetzt, token gelöscht");

  console.log("→ erneuter Confirm-Aufruf → state=already");
  const again = await fetch(localLink, { redirect: "manual" });
  check(/state=already/.test(again.headers.get("location") || ""), "Zweiter Confirm → 'already'");

  console.log("→ Cleanup-Logik: künstlich alten unbestätigten Eintrag anlegen");
  const oldDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString();
  const stale = await db.createDocument(DB, COL, "unique()", {
    email: `e2e-stale-${Date.now().toString(36)}@example.com`, consentAt: oldDate, confirmedAt: null, token: "x",
  });
  // Cleanup-Query nachbauen (wie im Cron)
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const staleList = await db.listDocuments(DB, COL, [Query.isNull("confirmedAt"), Query.lessThan("consentAt", cutoff), Query.limit(100)]);
  const found = staleList.documents.some((d) => d.$id === stale.$id);
  check(found, "Cron-Query erfasst alten unbestätigten Eintrag");
  await db.deleteDocument(DB, COL, stale.$id).catch(() => {});

  console.log("→ Aufräumen: Testeintrag löschen");
  await db.deleteDocument(DB, COL, before.documents[0].$id).catch(() => {});
} catch (e) {
  console.error("  ✗ FEHLER:", e.message);
  fail++;
} finally {
  server.close();
  console.log(`\n${fail === 0 ? "✅" : "❌"} ${pass} bestanden, ${fail} fehlgeschlagen.`);
  process.exit(fail === 0 ? 0 : 1);
}
