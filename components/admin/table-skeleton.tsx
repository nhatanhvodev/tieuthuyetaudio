export function TableSkeleton({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return (
    <div className="admin-panel overflow-hidden rounded-2xl">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-4 px-4 py-3">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={colIndex}
                className="h-4 animate-pulse rounded bg-slate-100"
                style={{ width: `${60 + (colIndex * 15) % 60}px` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
