import CardSkeleton from "@/components/CardSkeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="mb-8">
        <div className="skeleton h-9 w-72 rounded-lg" />
        <div className="skeleton mt-3 h-4 w-56 rounded" />
      </div>
      <div className="skeleton mb-5 h-12 w-full rounded-xl" />
      <div className="mb-8 flex flex-wrap gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="skeleton h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
