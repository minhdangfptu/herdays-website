import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { EmptyState, ErrorState, LoadingState } from '../../components/blog/AsyncState.jsx';
import { blogApi } from '../../services/apiService.js';
import blogTopicBanner from '../../assets/blog_topic_banner.png';
import './BlogPostsPage.scss';

const getPostImage = (post) => post.thumbnail || post.images?.[0] || blogTopicBanner;

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('vi-VN');
};

const getAuthorName = (post) => post.authorId?.fullName || 'HERDAYS';

const BlogPostsPage = () => {
  const { topicId } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState([]);
  const [topic, setTopic] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isActive = true;

    const fetchPosts = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const result = await blogApi.getTopicPosts(topicId, currentPage);
        if (!isActive) return;
        setPosts(result.posts || []);
        setTopic(result.topic || null);
        setPagination(result.pagination || null);
      } catch (error) {
        if (isActive) setErrorMessage(error.message);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    fetchPosts();

    return () => {
      isActive = false;
    };
  }, [currentPage, topicId]);

  const totalPages = pagination?.totalPages || 1;
  const relatedPosts = useMemo(() => posts.slice(0, 4), [posts]);

  const MainPostCard = ({ post }) => (
    <Link className="blog-posts-main-card" to={`/blog/${topicId}/posts/${post._id}`}>
      <div className="blog-posts-main-card__image">
        <img src={getPostImage(post)} alt={post.title} />
      </div>
      <div className="blog-posts-main-card__content">
        <h3 className="blog-posts-main-card__title">{post.title}</h3>
        <div className="blog-posts-main-card__meta">
          <div className="blog-posts-main-card__author-info">
            <span className="blog-posts-main-card__avatar">H</span>
            <span className="blog-posts-main-card__author">{getAuthorName(post)}</span>
          </div>
          <span className="blog-posts-main-card__date">{formatDate(post.createdAt)}</span>
        </div>
      </div>
    </Link>
  );

  const RelatedCard = ({ post }) => (
    <Link className="blog-posts-related-card" to={`/blog/${topicId}/posts/${post._id}`}>
      <div className="blog-posts-related-card__image">
        <img src={getPostImage(post)} alt={post.title} />
      </div>
      <div className="blog-posts-related-card__content">
        <h4 className="blog-posts-related-card__title">{post.title}</h4>
        <div className="blog-posts-related-card__meta">
          <span className="blog-posts-related-card__author">{getAuthorName(post)}</span>
          <span className="blog-posts-related-card__date">{formatDate(post.createdAt)}</span>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="blog-posts-page">
      <div className="blog-posts-banner">
        <div className="blog-posts-banner__inner">
          <h1 className="blog-posts-banner__title">
            {topic?.name || 'Bài viết HERDAYS'}
          </h1>
          <p className="blog-posts-banner__subtitle">
            {topic?.description || 'Các bài viết chuyên môn từ HERDAYS'}
          </p>
        </div>
      </div>

      <div className="blog-posts-container">
        {isLoading && <LoadingState label="Đang tải bài viết..." />}
        {!isLoading && errorMessage && <ErrorState message={errorMessage} />}
        {!isLoading && !errorMessage && posts.length === 0 && (
          <EmptyState message="Chưa có bài viết nào trong chủ đề này." />
        )}
        {!isLoading && !errorMessage && posts.length > 0 && (
          <div className="blog-posts-layout">
            <div className="blog-posts-main">
              {posts.map((post) => (
                <MainPostCard key={post._id} post={post} />
              ))}

              {totalPages > 1 && (
                <div className="blog-posts-pagination">
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      className={`blog-posts-pagination__btn ${
                        currentPage === page ? 'blog-posts-pagination__btn--active' : ''
                      }`}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <aside className="blog-posts-sidebar">
              <h2 className="blog-posts-sidebar__title">Bài viết liên quan</h2>
              <div className="blog-posts-sidebar__list">
                {relatedPosts.map((post) => (
                  <RelatedCard key={post._id} post={post} />
                ))}
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPostsPage;
