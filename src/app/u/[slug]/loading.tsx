import CardSkeleton from "@/components/CardSkeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="skeleton h-[168px] w-full rounded-3xl" />
      <div className="skeleton mb-5 mt-10 h-6 w-40 rounded" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
