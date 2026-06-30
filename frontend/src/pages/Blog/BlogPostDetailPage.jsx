import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ErrorState, LoadingState, EmptyState } from '../../components/blog/AsyncState.jsx'
import { blogApi } from '../../services/apiService.js'
import './BlogPostDetailPage.scss'

function BlogPostDetailPage() {
  const { topicId, postId } = useParams()
  const [post, setPost] = useState(null)
  const [relatedPosts, setRelatedPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isActive = true
    blogApi
      .getPost(postId)
      .then((result) => {
        if (!isActive) return
        setIsLoading(true)
        setErrorMessage('')
        setPost(result.post)
        const tid = result.post?.topicId?._id || result.post?.postTopicId?._id
        if (tid) return blogApi.getPostsByTopic(tid)
        return null
      })
      .then((relatedResult) => {
        if (!isActive || !relatedResult) return
        setRelatedPosts(
          (relatedResult.posts || []).filter((p) => p._id !== postId).slice(0, 4),
        )
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
  if (errorMessage) return <ErrorState message={errorMessage} />
  if (!post) return <EmptyState message="Không tìm thấy bài viết." />

  return (
    <div className="blog-detail-page">
      {/* ── Banner ────────────────────────────────────── */}
      <div className="blog-detail-banner">
        <div className="blog-detail-banner__inner">
          <Link className="blog-detail-banner__back" to={`/blog/${topicId}/posts`}>
            ← Quay lại
          </Link>
          <h1 className="blog-detail-banner__title">Bài viết: {post.title}</h1>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────── */}
      <div className="blog-detail-container">
        <div className="blog-detail-layout">
          <article className="blog-detail-article">
            {/* Meta */}
            <div className="blog-detail-article__meta">
              <span className="blog-detail-article__category">
                {post.postTopicId?.name || 'Chủ đề'}
              </span>
              <span className="blog-detail-article__dot">·</span>
              <span className="blog-detail-article__author">
                {post.authorId?.fullName || 'HERDAYS'}
              </span>
              <span className="blog-detail-article__dot">·</span>
              <time className="blog-detail-article__date">
                {new Date(post.createdAt).toLocaleDateString('vi-VN')}
              </time>
            </div>

            {/* Title */}
            <h2 className="blog-detail-article__title">{post.title}</h2>

            {/* Rich-text body (BE sends <h1>/<h2>/<h3>/<p>/<ol>/<ul>/<img> inside <span>) */}
            <div
              className="blog-detail-article__content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

          {/* ── Related Posts ──────────────────────────── */}
          {relatedPosts.length > 0 && (
            <section className="blog-detail-related">
              <h3 className="blog-detail-related__heading">
                Các bài viết cùng chủ đề
              </h3>
              <div className="blog-detail-related__grid">
                {relatedPosts.map((item) => (
                  <Link
                    key={item._id}
                    className="blog-detail-related__card"
                    to={`/blog/${topicId}/posts/${item._id}`}
                  >
                    <div className="blog-detail-related__card-img">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          loading="lazy"
                        />
                      ) : (
                        <span className="blog-detail-related__card-placeholder">
                          📝
                        </span>
                      )}
                    </div>
                    <div className="blog-detail-related__card-body">
                      <h4 className="blog-detail-related__card-title">
                        {item.title}
                      </h4>
                      <div className="blog-detail-related__card-meta">
                        <span className="blog-detail-related__card-author">
                          {item.authorId?.fullName || 'HERDAYS'}
                        </span>
                        <span className="blog-detail-related__card-dot">
                          ·
                        </span>
                        <span className="blog-detail-related__card-date">
                          {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

export default BlogPostDetailPage
