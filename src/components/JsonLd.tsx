/** Rendert ein JSON-LD-Script (Structured Data für Suchmaschinen). Server-Component. */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify ist sicher; keine User-HTML-Injektion, nur Daten.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
