/**
 * T4-E2E: Melde-Flow + Admin-API durchspielen (mit Wegwerf-Nutzern), räumt auf.
 * Start: APPWRITE_API_KEY="<key>" node scripts/test-reports.mjs
 */
import { Client as SrvClient, Users, Databases, ID } from "node-appwrite";

const ENDPOINT = "https://appwrite.it-handwerk-stuttgart.de/v1";
const PROJECT = "6a4453770009b9e7f029";
const KEY = process.env.APPWRITE_API_KEY;
const BASE = "http://localhost:3000";
const DB = "marketplace";
const H = { "X-Appwrite-Project": PROJECT, "Content-Type": "application/json" };

const srv = new SrvClient().setEndpoint(ENDPOINT).setProject(PROJECT).setKey(KEY);
const users = new Users(srv);
const sdb = new Databases(srv);

// Session per REST anlegen, Session-Secret aus dem Set-Cookie ziehen
async function sessionSecret(u) {
  const r = await fetch(`${ENDPOINT}/account/sessions/email`, {
    method: "POST", headers: H, body: JSON.stringify({ email: u.email, password: u.password }),
  });
  const cookies = r.headers.getSetCookie?.() || [];
  const m = cookies.map((c) => c.match(new RegExp(`a_session_${PROJECT}=([^;]+)`))).find(Boolean);
  return m ? decodeURIComponent(m[1]) : "";
}
async function jwtFor(u) {
  const secret = await sessionSecret(u);
  const r = await fetch(`${ENDPOINT}/account/jwts`, { method: "POST", headers: { ...H, "X-Appwrite-Session": secret } });
  return { secret, jwt: (await r.json()).jwt };
}

const suffix = Date.now().toString(36);
const reporter = { email: `e2e-rep-${suffix}@example.com`, password: `E2e!${suffix}Rep99`, name: "Reporter" };
const admin = { email: `e2e-adm-${suffix}@example.com`, password: `E2e!${suffix}Adm99`, name: "Admin" };
let reporterId, adminId, reportId;
let pass = 0, fail = 0;
const check = (ok, label) => { console.log(ok ? "  ✓" : "  ✗", label); ok ? pass++ : fail++; };

try {
  console.log("→ Wegwerf-Nutzer anlegen");
  reporterId = (await users.create(ID.unique(), reporter.email, undefined, reporter.password, reporter.name)).$id;
  adminId = (await users.create(ID.unique(), admin.email, undefined, admin.password, admin.name)).$id;
  await users.updateLabels(adminId, ["admin"]);
  check(true, "Reporter + Admin angelegt");

  console.log("→ Reporter meldet eine Komponente (REST als Nutzer)");
  const repSecret = await sessionSecret(reporter);
  const createRes = await fetch(`${ENDPOINT}/databases/${DB}/collections/reports/documents`, {
    method: "POST", headers: { ...H, "X-Appwrite-Session": repSecret },
    body: JSON.stringify({
      documentId: ID.unique(),
      data: {
        targetType: "component", targetId: "test-target-id", reason: "spam",
        details: "E2E-Testmeldung", reporterId, reporterName: reporter.name,
        status: "open", createdAt: new Date().toISOString(),
      },
    }),
  });
  const created = await createRes.json();
  reportId = created.$id;
  check(createRes.status === 201 && Boolean(reportId), "Meldung als Nutzer erstellt (create(users) erlaubt)");

  console.log("→ Reporter darf NICHT lesen (nur Key)");
  const readRes = await fetch(`${ENDPOINT}/databases/${DB}/collections/reports/documents`, {
    headers: { ...H, "X-Appwrite-Session": repSecret },
  });
  check(readRes.status !== 200, `Nutzer kann Meldungen nicht auflisten (HTTP ${readRes.status})`);

  console.log("→ Admin-API GET mit Admin-JWT");
  const { jwt: adminJwt } = await jwtFor(admin);
  const getRes = await fetch(`${BASE}/api/admin/reports?status=open`, { headers: { Authorization: `Bearer ${adminJwt}` } });
  const getData = await getRes.json();
  check(getRes.status === 200 && getData.ok, "Admin-GET liefert 200");
  check(getData.reports?.some((r) => r.id === reportId), "Eigene Testmeldung ist in der Liste");

  console.log("→ Nicht-Admin bekommt 403");
  const { jwt: repJwt } = await jwtFor(reporter);
  const forbid = await fetch(`${BASE}/api/admin/reports`, { headers: { Authorization: `Bearer ${repJwt}` } });
  check(forbid.status === 403, "Normaler Nutzer → 403");

  console.log("→ Admin verwirft die Meldung (PATCH)");
  const patch = await fetch(`${BASE}/api/admin/reports`, {
    method: "PATCH", headers: { Authorization: `Bearer ${adminJwt}`, "Content-Type": "application/json" },
    body: JSON.stringify({ id: reportId, status: "dismissed" }),
  });
  check(patch.status === 200, "PATCH → 200");
  const after = await sdb.getDocument(DB, "reports", reportId);
  check(after.status === "dismissed", "Status ist jetzt 'dismissed'");
} catch (e) {
  console.error("  ✗ FEHLER:", e.message);
  fail++;
} finally {
  console.log("→ Aufräumen");
  if (reportId) await sdb.deleteDocument(DB, "reports", reportId).catch(() => {});
  if (reporterId) await users.delete(reporterId).catch(() => {});
  if (adminId) await users.delete(adminId).catch(() => {});
  console.log(`\n${fail === 0 ? "✅" : "❌"} ${pass} bestanden, ${fail} fehlgeschlagen.`);
  process.exit(fail === 0 ? 0 : 1);
}
