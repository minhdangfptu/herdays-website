import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'

import { ErrorState, LoadingState, EmptyState } from '../../components/blog/AsyncState.jsx'
import { blogApi } from '../../services/apiService.js'
import './BlogPostDetailPage.scss'

const formatDate = (value) => {
  if (!value) return ''
  return new Date(value).toLocaleDateString('vi-VN')
}

const getAuthorName = (post) => post.authorId?.fullName || 'HERDAYS Admin'

const getInitials = (name) => {
  const words = (name || 'HERDAYS')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (words.length >= 2) return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
  return (words[0] || 'H').slice(0, 2).toUpperCase()
}

function BlogPostDetailPage() {
  const { topicId, postId } = useParams()
  const [post, setPost] = useState(null)
  const [relatedPosts, setRelatedPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isActive = true

    const fetchPost = async () => {
      setIsLoading(true)
      setErrorMessage('')
      setRelatedPosts([])

      try {
        const result = await blogApi.getPost(postId)
        if (!isActive) return
        setPost(result.post)
        const tid = result.post?.topicId?._id || result.post?.postTopicId?._id
        if (!tid) return
        const relatedResult = await blogApi.getTopicPosts(tid)
        if (isActive) {
          setRelatedPosts(
            (relatedResult.posts || []).filter((p) => p._id !== postId).slice(0, 4),
          )
        }
      } catch (error) {
        if (isActive) setErrorMessage(error.message)
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    fetchPost()

    return () => {
      isActive = false
    }
  }, [postId])

  if (isLoading) return <LoadingState label="Đang tải bài viết..." />
  if (errorMessage) return <ErrorState message={errorMessage} />
  if (!post) return <EmptyState message="Không tìm thấy bài viết." />

  const authorName = getAuthorName(post)

  return (
    <div className="blog-detail-page">
      <div className="blog-detail-container">
        <Link className="blog-detail-back-button" to={`/blog/${topicId}/posts`}>
          <FiArrowLeft size={18} />
          <span>Quay lại</span>
        </Link>

        <div className="blog-detail-layout">
          <article className="blog-detail-article">
            <header className="blog-detail-article__header">
              <h1 className="blog-detail-article__title">{post.title}</h1>

              <div className="blog-detail-author">
                <div className="blog-detail-author__profile">
                  <span className="blog-detail-author__avatar">{getInitials(authorName)}</span>
                  <span className="blog-detail-author__text">
                    <strong>{authorName}</strong>
                    <span>Tác giả</span>
                  </span>
                </div>
                <time className="blog-detail-author__date">
                  {formatDate(post.createdAt)}
                </time>
              </div>
            </header>

            {post.thumbnail && (
              <img className="blog-detail-article__hero" src={post.thumbnail} alt={post.title} />
            )}

            <div
              className="blog-detail-article__content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

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
                          H
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
                          {formatDate(item.createdAt)}
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
