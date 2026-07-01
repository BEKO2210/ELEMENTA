/** Platzhalter-Karte mit Shimmer — für Ladezustände im Komponenten-Grid. */
export default function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-panel">
      <div className="skeleton h-[200px] w-full" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="flex justify-between pt-1">
          <div className="skeleton h-3 w-16 rounded" />
          <div className="skeleton h-3 w-10 rounded" />
        </div>
      </div>
    </div>
  );
}
