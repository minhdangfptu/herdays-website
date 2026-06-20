import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { EmptyState, ErrorState, LoadingState } from '../components/blog/AsyncState.jsx'
import PostCard from '../components/blog/PostCard.jsx'
import { blogApi } from '../services/apiService.js'

function BlogPostsPage() {
  const { topicId } = useParams()
  const [data, setData] = useState({ topic: null, posts: [], pagination: null })
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const fetchPosts = async () => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      setData(await blogApi.getTopicPosts(topicId, page))
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isActive = true
    blogApi.getTopicPosts(topicId, page)
      .then((result) => {
        if (isActive) setData(result)
      })
      .catch((error) => {
        if (isActive) setErrorMessage(error.message)
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })
    return () => {
      isActive = false
    }
  }, [topicId, page])

  if (isLoading) return <LoadingState label="Đang tải bài viết..." />
  if (errorMessage) return <ErrorState message={errorMessage} onRetry={fetchPosts} />

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Link className="font-semibold text-pink-600 hover:text-pink-700" to="/blog">← Tất cả chủ đề</Link>
      <div className="my-9 max-w-3xl">
        <h1 className="text-4xl font-extrabold text-slate-800">{data.topic?.name}</h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">{data.topic?.description}</p>
      </div>

      {data.posts.length === 0 ? <EmptyState message="Chủ đề này chưa có bài viết được xuất bản." /> : (
        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {data.posts.map((post) => <PostCard key={post._id} post={post} topicId={topicId} />)}
        </div>
      )}

      {data.pagination?.totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-3">
          <button className="rounded-full border border-pink-200 px-5 py-2 disabled:opacity-40" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Trang trước</button>
          <span className="px-3 py-2">{page}/{data.pagination.totalPages}</span>
          <button className="rounded-full border border-pink-200 px-5 py-2 disabled:opacity-40" disabled={page === data.pagination.totalPages} onClick={() => setPage((value) => value + 1)}>Trang sau</button>
        </div>
      )}
    </main>
  )
}

export default BlogPostsPage
