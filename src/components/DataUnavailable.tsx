import { CloudOff } from "lucide-react";

/**
 * Ehrlicher Zustand, wenn die Live-Datenbank nicht erreichbar ist (T6).
 * Zeigt bewusst KEINE Platzhalter-Komponenten oder erfundenen Zahlen.
 */
export default function DataUnavailable({ title }: { title?: string }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-panel px-6 py-14 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-400/10 text-amber-300">
        <CloudOff size={26} />
      </span>
      <h2 className="mt-6 text-xl font-bold">{title || "Live-Daten derzeit nicht verfügbar"}</h2>
      <p className="mx-auto mt-3 max-w-sm text-sm text-fg-muted">
        Wir können die Komponenten gerade nicht aus der Datenbank laden. Bitte versuch es in ein
        paar Minuten noch einmal — wir zeigen dir bewusst keine Platzhalter oder erfundenen Zahlen.
      </p>
    </div>
  );
}
