import { Skeleton } from '../Skeleton.jsx'

export function LoadingState({ label = 'Loading' }) {
  return (
    <div className="space-y-4 rounded-2xl border border-pink-100 bg-white p-6" role="status" aria-label={label}>
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-40 w-full" />
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
