import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Form, Search } from 'lucide-react';
import { blogApi } from '../../services/apiService.js';
import { EmptyState, ErrorState, LoadingState } from '../../components/blog/AsyncState.jsx';
import blogTopicBanner from '../../assets/blog_topic_banner.png';
import './BlogSearchPostPage.scss';

const getPostImage = (post) => post.thumbnail || post.images?.[0] || blogTopicBanner;

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('vi-VN');
};

const getAuthorName = (post) => post.authorId?.fullName || 'HERDAYS';

const BlogSearchResultCard = ({ post }) => (
  <Link className="blog-search-result-card" to={`/blog/${post.topicId?._id || post.topicId}/posts/${post._id}`}>
    <div className="blog-search-result-card__image">
      <img src={getPostImage(post)} alt={post.title} />
    </div>
    <div className="blog-search-result-card__content">
      <h3 className="blog-search-result-card__title">{post.title}</h3>
      <div className="blog-search-result-card__meta">
        <div className="blog-search-result-card__author-info">
          <span className="blog-search-result-card__avatar">H</span>
          <span className="blog-search-result-card__author">{getAuthorName(post)}</span>
        </div>
        <span className="blog-search-result-card__date">{formatDate(post.createdAt)}</span>
      </div>
    </div>
  </Link>
);

export default function BlogSearchPostPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(urlQuery);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [topics, setTopics] = useState([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const urlQueryRef = useRef(urlQuery);

  const hasSearched = urlQuery.length > 0;

  useEffect(() => {
    urlQueryRef.current = urlQuery;
  }, [urlQuery]);

  useEffect(() => {
    let isActive = true;
    const fetchTopics = async () => {
      setIsLoadingTopics(true);
      try {
        const result = await blogApi.getTopics();
        if (isActive) setTopics(result.topics || []);
      } catch (err) {
        if (isActive) setErrorMessage(err.message);
      } finally {
        if (isActive) setIsLoadingTopics(false);
      }
    };
    fetchTopics();
    return () => { isActive = false; };
  }, []);

  useEffect(() => {
    if (!urlQuery) return;

    let cancelled = false;

    // Defer setState to after the current render cycle — avoids sync setState in effect body.
    const startSearch = () => {
      setIsSearching(true);
      setSearchError('');

      blogApi.searchPosts({ q: urlQuery })
        .then((result) => {
          if (!cancelled) {
            setIsSearching(false);
            setSearchResults(result?.posts || result?.data || result || []);
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setIsSearching(false);
            setSearchError(err.message);
            setSearchResults([]);
          }
        });
    };

    const id = requestAnimationFrame(startSearch);
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, [urlQuery]);

  const handleTopicClick = (topic) => {
    navigate(`/blog/${topic._id}/posts`);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchInput.trim();
    
    if (!query) {
      setSearchParams({}); // Xóa biến 'q' khỏi URL nếu ô input trống
      return;
    }
    
    setSearchParams({ q: query });
  };

  return (
    <div className="blog-search-page">
      {/* Hero Section */}
      <div className="blog-search-hero">
        <div className="blog-search-hero-container">
          <h1 style={{ color: '#F176A9' }} className="blog-search-hero-title">Tìm kiếm bài viết</h1>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="blog-search-form">
            <div className="blog-search-input-wrapper">
              <Form size={16} className="blog-search-input-icon" strokeWidth={2} />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Nhập từ khóa tìm kiếm"
                className="blog-search-input contact-control"
              />
              <button type="submit" className="blog-search-btn">
                <Search size={20} className="blog-search-input-icon" strokeWidth={4} />
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="blog-search-container">
        {/* Search Results */}
        {hasSearched && (
          <div className="blog-search-results">
            <h2 className="blog-search-results__title">
              Kết quả tìm kiếm cho "{urlQuery}"
            </h2>

            {isSearching ? (
              <LoadingState label="Đang tìm kiếm..." />
            ) : searchError ? (
              <ErrorState message={searchError} />
            ) : searchResults.length === 0 ? (
              <EmptyState message={`Không tìm thấy bài viết nào cho "${urlQuery}".`} />
            ) : (
              <div className="blog-search-results__grid">
                {searchResults.map((post) => (
                  <BlogSearchResultCard key={post._id} post={post} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Category Section */}
        <h2 className="blog-search-category-title">Khám phá theo chủ đề</h2>

        {isLoadingTopics ? (
          <LoadingState label="Đang tải chủ đề..." />
        ) : errorMessage ? (
          <ErrorState message={errorMessage} />
        ) : (
          <div className="blog-search-categories">
            {topics.map((topic) => (
              <button
                key={topic._id}
                onClick={() => handleTopicClick(topic)}
                className="blog-search-category-btn"
              >
                {topic.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
