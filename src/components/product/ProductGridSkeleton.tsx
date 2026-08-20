export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        // Index as key is fine here — this is a fixed-length, never-reordered skeleton list,
        // not real data with identity.
        <div key={index}>
          <div className="skeleton aspect-[3/4] rounded-md" />
          <div className="skeleton mt-3 h-3 w-1/3 rounded" />
          <div className="skeleton mt-2 h-4 w-4/5 rounded" />
          <div className="skeleton mt-2 h-4 w-1/4 rounded" />
        </div>
      ))}
    </div>
  );
}