import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ErrorState, LoadingState } from '../components/blog/AsyncState.jsx'
import { blogApi } from '../services/apiService.js'

function BlogPostDetailPage() {
  const { topicId, postId } = useParams()
  const [post, setPost] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const fetchPost = async () => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const result = await blogApi.getPost(postId)
      setPost(result.post)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isActive = true
    blogApi.getPost(postId)
      .then((result) => {
        if (isActive) setPost(result.post)
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
  }, [postId])

  if (isLoading) return <LoadingState label="Đang tải bài viết..." />
  if (errorMessage) return <ErrorState message={errorMessage} onRetry={fetchPost} />

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link className="font-semibold text-pink-600 hover:text-pink-700" to={`/blog/${topicId}/posts`}>← Quay lại chủ đề</Link>
      <article className="mt-8 overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm">
        {post.thumbnail && <img className="max-h-[480px] w-full object-cover" src={post.thumbnail} alt="" />}
        <div className="p-6 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-pink-500">{post.postTopicId?.name}</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight text-slate-800 sm:text-5xl">{post.title}</h1>
          <p className="mt-5 text-sm text-slate-500">
            {post.authorId?.fullName || 'HERDAYS'} · {new Date(post.createdAt).toLocaleDateString('vi-VN')}
          </p>
          <div className="blog-content mt-10" dangerouslySetInnerHTML={{ __html: post.content }} />
          {post.images?.length > 0 && (
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {post.images.map((image, index) => (
                <img className="w-full rounded-2xl object-cover" src={image} alt={`Ảnh bài viết ${index + 1}`} loading="lazy" key={`${image}-${index}`} />
              ))}
            </div>
          )}
        </div>
      </article>
    </main>
  )
}

export default BlogPostDetailPage
