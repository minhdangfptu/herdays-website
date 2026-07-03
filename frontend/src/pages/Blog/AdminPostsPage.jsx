import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { EmptyState, ErrorState, LoadingState } from '../../components/blog/AsyncState.jsx'
import PostEditor from '../../components/blog/PostEditor.jsx'
import TopicImageManager from '../../components/blog/TopicImageManager.jsx'
import { blogApi } from '../../services/apiService.js'

function AdminPostsPage() {
  const postPageSize = 5
  const [topics, setTopics] = useState([])
  const [posts, setPosts] = useState([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: postPageSize,
    totalItems: 0,
    totalPages: 1
  })
  const [postPage, setPostPage] = useState(1)
  const [selectedTopicId, setSelectedTopicId] = useState('')
  const [selectedPost, setSelectedPost] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPostsLoading, setIsPostsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const fetchPosts = async (page = postPage) => {
    setIsPostsLoading(true)
    setErrorMessage('')
    try {
      const postResult = await blogApi.getAdminPosts({
        page,
        limit: postPageSize,
        topicId: selectedTopicId
      })
      setPosts(postResult.posts)
      setPagination(postResult.pagination || {
        currentPage: page,
        limit: postPageSize,
        totalItems: postResult.posts.length,
        totalPages: 1
      })
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsPostsLoading(false)
    }
  }

  const fetchDashboard = async (page = postPage) => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const topicResult = await blogApi.getTopics()
      setTopics(topicResult.topics)
      await fetchPosts(page)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isActive = true
    Promise.all([
      blogApi.getTopics(),
      blogApi.getAdminPosts({
        page: postPage,
        limit: postPageSize,
        topicId: selectedTopicId
      })
    ])
      .then(([topicResult, postResult]) => {
        if (!isActive) return
        setTopics(topicResult.topics)
        setPosts(postResult.posts)
        setPagination(postResult.pagination || {
          currentPage: postPage,
          limit: postPageSize,
          totalItems: postResult.posts.length,
          totalPages: 1
        })
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
  }, [postPage, selectedTopicId])

  const handleEdit = async (postId) => {
    setErrorMessage('')
    try {
      const result = await blogApi.getAdminPost(postId)
      setSelectedPost(result.post)
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  const handleSaved = async (message) => {
    setSuccessMessage(message)
    setSelectedPost(null)
    setPostPage(1)
    await fetchDashboard(1)
  }

  const handleTopicFilterChange = (event) => {
    setSelectedTopicId(event.target.value)
    setPostPage(1)
  }

  if (isLoading) return <LoadingState label="Đang tải dashboard..." />
  if (errorMessage && posts.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <ErrorState message={errorMessage} onRetry={fetchDashboard} />
        <p className="text-center"><Link className="font-semibold text-pink-600" to="/">Đăng nhập lại</Link></p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-widest text-pink-500">Quản trị nội dung</p>
        <h1 className="mt-2 text-4xl font-extrabold text-slate-800">Bài viết HERDAYS</h1>
      </div>

      {successMessage && <p className="mb-6 rounded-xl bg-emerald-50 p-4 font-medium text-emerald-700" role="status">{successMessage}</p>}
      {errorMessage && <p className="mb-6 rounded-xl bg-red-50 p-4 font-medium text-red-700" role="alert">{errorMessage}</p>}

      <TopicImageManager topics={topics} onUpdated={handleSaved} />

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <PostEditor
          key={selectedPost?._id || 'new-post'}
          post={selectedPost}
          topics={topics}
          onSaved={handleSaved}
          onCancel={() => setSelectedPost(null)}
        />

        <section className="rounded-3xl border border-pink-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Danh sách bài viết</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {pagination.totalItems} bài viết
              </p>
            </div>
            <label className="flex min-w-[220px] flex-col gap-2 text-sm font-semibold text-slate-600">
              <select
                className="rounded-xl border border-pink-100 bg-white px-3 py-2 font-medium text-slate-700 outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
                value={selectedTopicId}
                onChange={handleTopicFilterChange}
                disabled={isPostsLoading}
              >
                <option value="">Tất cả chủ đề</option>
                {topics.map((topic) => (
                  <option key={topic._id} value={topic._id}>{topic.name}</option>
                ))}
              </select>
            </label>
          </div>
          {posts.length === 0 ? (
            <EmptyState
              message={selectedTopicId
                ? 'Chủ đề này chưa có bài viết.'
                : 'Chưa có bài viết. Hãy tạo bài đầu tiên.'}
            />
          ) : (
            <>
              <div className={`grid gap-3 ${isPostsLoading ? 'opacity-60' : ''}`}>
                {posts.map((post) => (
                  <article className="rounded-2xl border border-slate-100 p-4" key={post._id}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-pink-500">{post.postTopicId?.name}</p>
                        <h3 className="mt-1 font-bold text-slate-800">{post.title}</h3>
                        <p className="mt-2 text-xs text-slate-500">{post.status} · {new Date(post.updatedAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                      <button className="shrink-0 rounded-full border border-pink-200 px-3 py-1 text-sm font-semibold text-pink-600 hover:bg-pink-50" onClick={() => handleEdit(post._id)}>Sửa</button>
                    </div>
                  </article>
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-pink-50 pt-5 text-sm">
                  <span className="font-medium text-slate-500">
                    Trang {pagination.currentPage} / {pagination.totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-full border border-pink-200 px-4 py-2 font-semibold text-pink-600 transition hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-40"
                      type="button"
                      disabled={isPostsLoading || pagination.currentPage <= 1}
                      onClick={() => setPostPage((value) => Math.max(1, value - 1))}
                    >
                      Trước
                    </button>
                    <button
                      className="rounded-full border border-pink-200 px-4 py-2 font-semibold text-pink-600 transition hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-40"
                      type="button"
                      disabled={isPostsLoading || pagination.currentPage >= pagination.totalPages}
                      onClick={() => setPostPage((value) => Math.min(pagination.totalPages, value + 1))}
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  )
}

export default AdminPostsPage
