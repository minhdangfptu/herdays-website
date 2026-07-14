import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import { Search } from 'lucide-react';

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
  const [allTopics, setAllTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isActive = true;

    const fetchAll = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [topicsResult, postsResult] = await Promise.all([
          blogApi.getTopics(),
          searchQuery
            ? blogApi.searchPosts({ q: searchQuery, page: currentPage })
            : blogApi.getTopicPosts(topicId, currentPage),
        ]);
        if (!isActive) return;
        setAllTopics(topicsResult.topics || []);
        setPosts(postsResult.posts || []);
        if (postsResult.topic !== undefined) {
          setTopic(postsResult.topic || null);
        }
        setPagination(postsResult.pagination || null);
      } catch (error) {
        if (isActive) setErrorMessage(error.message);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    fetchAll();

    return () => {
      isActive = false;
    };
  }, [currentPage, topicId, searchQuery]);

  const totalPages = pagination?.totalPages || 1;

  const relatedPosts = useMemo(() => {
    return allTopics
      .filter((t) => t._id !== topicId)
      .slice(0, 4)
      .map((t) => ({
        _id: t._id,
        title: t.name,
        topicId: t._id,
        thumbnail: t.image || null,
        images: t.image ? [t.image] : [],
        authorId: null,
        createdAt: null,
      }));
  }, [allTopics, topicId]);

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
  const navigate = useNavigate();
  const RelatedCard = ({ post }) => (
    <Link className="blog-posts-related-card" to={`/blog/${post.topicId}/posts`}>
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

      <p className="blog-posts-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <FiChevronRight size={14} />
        <Link to="/blog">Chủ đề</Link>
        <FiChevronRight size={14} />
        <span>{topic?.name || 'Chủ đề'}</span>
      </p>

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
              <h2 className="blog-posts-sidebar__title">Chủ đề khác</h2>
              
              <div className="blog-posts-sidebar__list">
                {relatedPosts.map((post) => (
                  <RelatedCard key={post._id} post={post} />
                ))}
              </div>
              <div className="blog-posts-sidebar__search">
                <Search size={15} className="blog-posts-sidebar__search-icon" strokeWidth={2} />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      navigate(`/blog/search?q=${searchInput}`);
                    }
                  }}
                  className="blog-posts-sidebar__search-input"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery(searchInput);
                    navigate(`/blog/search?q=${searchInput}`);
                    setCurrentPage(1);
                  }}
                  className="blog-posts-sidebar__search-btn"
                >
                  <Search size={15} className="blog-posts-sidebar__search-icon" strokeWidth={2} />
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPostsPage;
