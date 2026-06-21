export function LoadingState({ label = 'Đang tải dữ liệu...' }) {
  return (
    <div className="grid min-h-64 place-items-center" role="status">
      <div className="text-center text-slate-500">
        <span className="mx-auto mb-3 block size-9 animate-spin rounded-full border-4 border-pink-100 border-t-pink-500" />
        {label}
      </div>
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="mx-auto my-12 max-w-xl rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
      <p className="font-medium text-red-700">{message}</p>
      {onRetry && (
        <button className="mt-4 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white" onClick={onRetry}>
          Thử lại
        </button>
      )}
    </div>
  )
}

export function EmptyState({ message }) {
  return (
    <div className="rounded-3xl border border-dashed border-pink-200 bg-white p-12 text-center text-slate-500">
      {message}
    </div>
  )
}
