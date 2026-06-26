import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { EmptyState, ErrorState, LoadingState } from '../../components/blog/AsyncState.jsx'
import { blogApi } from '../../services/apiService.js'

function BlogTopicsPage() {
  const [topics, setTopics] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const fetchTopics = async () => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const result = await blogApi.getTopics()
      setTopics(result.topics)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isActive = true
    blogApi.getTopics()
      .then((result) => {
        if (isActive) setTopics(result.topics)
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
  }, [])

  if (isLoading) return <LoadingState label="Đang tải chủ đề..." />
  if (errorMessage) return <ErrorState message={errorMessage} onRetry={fetchTopics} />

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-pink-500">HERDAYS Blog</p>
        <h1 className="text-4xl font-extrabold text-slate-800 sm:text-5xl">Kiến thức cho hành trình của bạn</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">Khám phá nội dung sức khỏe nữ giới được sắp xếp theo từng giai đoạn.</p>
      </div>

      {topics.length === 0 ? <EmptyState message="Chưa có chủ đề blog nào." /> : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <Link
              className="group overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              key={topic._id}
              to={`/blog/${topic._id}/posts`}
            >
              {topic.imgThumbnail ? (
                <img className="aspect-[16/9] w-full object-cover" src={topic.imgThumbnail} alt="" loading="lazy" />
              ) : <div className="h-36 bg-gradient-to-br from-pink-300 via-pink-200 to-rose-100" />}
              <div className="p-6">
                <h2 className="text-xl font-bold text-slate-800 group-hover:text-pink-600">{topic.name}</h2>
                <p className="mt-3 leading-7 text-slate-600">{topic.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}

export default BlogTopicsPage
