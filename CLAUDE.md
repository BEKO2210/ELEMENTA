@AGENTS.md

## Deployment / Betrieb — WICHTIG

Die Website läuft **live** und ist über einen **cloudflared-Tunnel** öffentlich erreichbar
(unter ui.it-handwerk-stuttgart.de). Der Tunnel ist fest auf **Port 3000** gebunden.

**Regeln:**
- Den Port **NIEMALS ändern** — immer Port `3000` verwenden.
- Nach Änderungen: `npm run build`, dann den laufenden Server auf **demselben Port 3000**
  neu starten (nicht auf einem anderen Port testen). Zum Testen ggf. kurz `curl localhost:3000`.
- Alten Server sauber beenden (`pkill -f next-server`) und direkt wieder auf 3000 starten,
  z. B. `nohup npm run start >/dev/null 2>&1 &` — sonst ist die Live-Seite offline.
