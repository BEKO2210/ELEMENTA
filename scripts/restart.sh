#!/bin/bash
# Sauberer Neustart des Elementa-Servers auf Port 3000 (nur belkis-Prozesse).
# -fx matcht NUR die exakte Prozess-Kommandozeile "next-server (vX.Y.Z)" —
# nie die eigene Shell und nie Container-Prozesse.
cd "$(dirname "$0")/.." || exit 1
pkill -u "$(id -u)" -fx 'next-server \(v[0-9.]+\)' 2>/dev/null
sleep 1
nohup npm run start >/dev/null 2>&1 &
for i in $(seq 1 30); do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 2 localhost:3000 2>/dev/null)
  [ "$code" = "200" ] && { echo "online: 200"; exit 0; }
  sleep 1
done
echo "FEHLER: Server nicht erreichbar" >&2
exit 1
