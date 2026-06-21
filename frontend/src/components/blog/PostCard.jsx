import { Link } from 'react-router-dom'

function PostCard({ post, topicId }) {
  const authorName = post.authorId?.fullName || 'HERDAYS'

  return (
    <article className="group overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      {post.thumbnail ? (
        <img className="aspect-[16/9] w-full object-cover" src={post.thumbnail} alt="" loading="lazy" />
      ) : (
        <div className="grid aspect-[16/9] place-items-center bg-gradient-to-br from-pink-100 to-pink-50 text-4xl">🌸</div>
      )}
      <div className="p-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-pink-500">
          {new Date(post.createdAt).toLocaleDateString('vi-VN')} · {authorName}
        </p>
        <h2 className="line-clamp-2 text-xl font-bold text-slate-800 group-hover:text-pink-600">{post.title}</h2>
        <Link
          className="mt-5 inline-flex font-semibold text-pink-600 hover:text-pink-700"
          to={`/blog/${topicId}/posts/${post._id}`}
        >
          Đọc bài viết →
        </Link>
      </div>
    </article>
  )
}

export default PostCard
