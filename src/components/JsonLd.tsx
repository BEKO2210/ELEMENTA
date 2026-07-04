/** Rendert ein JSON-LD-Script (Structured Data für Suchmaschinen). Server-Component. */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  // WICHTIG: "<" escapen — Nutzerdaten (Titel/Beschreibungen) fließen in dieses
  // JSON. Ein "</script>" im Titel würde sonst aus dem Script-Block ausbrechen (XSS).
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
