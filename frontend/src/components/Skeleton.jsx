export function Skeleton({ className = '' }) {
  return <span aria-hidden="true" className={`block animate-pulse rounded bg-slate-200 ${className}`} />
}

export function TableSkeleton({ columns = 5, rows = 6 }) {
  return (
    <div className="space-y-3" role="status" aria-label="Đang tải dữ liệu">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div className="grid items-center gap-4" key={rowIndex} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }, (_, columnIndex) => (
            <Skeleton className="h-5 w-full" key={columnIndex} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardGridSkeleton({ count = 3 }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Đang tải dữ liệu">
      {Array.from({ length: count }, (_, index) => (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white" key={index}>
          <Skeleton className="aspect-[4/3] rounded-none" />
          <div className="space-y-4 p-5">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-20 w-full" />
            <div className="flex gap-3">
              <Skeleton className="h-11 flex-1" />
              <Skeleton className="h-11 flex-1" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
