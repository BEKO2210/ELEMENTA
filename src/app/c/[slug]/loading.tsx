export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      {/* Breadcrumb */}
      <div className="flex gap-2">
        <div className="skeleton h-4 w-16 rounded" />
        <div className="skeleton h-4 w-20 rounded" />
        <div className="skeleton h-4 w-24 rounded" />
      </div>

      {/* Header */}
      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="w-full max-w-2xl space-y-3">
          <div className="skeleton h-8 w-1/2 rounded-lg" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-2/3 rounded" />
          <div className="flex gap-2 pt-1">
            <div className="skeleton h-7 w-28 rounded-full" />
            <div className="skeleton h-7 w-20 rounded-full" />
            <div className="skeleton h-7 w-24 rounded-full" />
          </div>
        </div>
        <div className="skeleton h-10 w-36 rounded-xl" />
      </div>

      {/* Preview */}
      <div className="skeleton mt-6 h-[440px] w-full rounded-2xl" />

      {/* Code */}
      <div className="skeleton mt-5 h-[300px] w-full rounded-2xl" />
    </div>
  );
}
