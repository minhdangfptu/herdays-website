import { useEffect } from 'react'

function DeletePostModal({ post, isDeleting, onClose, onConfirm }) {
  useEffect(() => {
    if (!post) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isDeleting) onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDeleting, onClose, post])

  if (!post) return null

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget && !isDeleting) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <section
        aria-labelledby="delete-post-title"
        aria-modal="true"
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
        role="dialog"
      >
        <h2 id="delete-post-title" className="text-xl font-bold text-slate-900">
          Xác nhận xóa bài viết
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Bạn có chắc muốn xóa bài viết <strong className="text-slate-800">“{post.title}”</strong>?
          Hành động này không thể hoàn tác.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isDeleting}
            onClick={onClose}
            type="button"
          >
            Hủy
          </button>
          <button
            className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isDeleting}
            onClick={onConfirm}
            type="button"
          >
            {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default DeletePostModal
