import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiSearch, FiX } from 'react-icons/fi';

import { EmptyState, ErrorState, LoadingState } from '../../components/blog/AsyncState.jsx';
import { blogApi, hasAuthSession, profileApi } from '../../services/apiService.js';
import blogTopicBanner from '../../assets/blog_topic_banner.png';
import './BlogTopicsPage.scss';

const SECTION_POST_LIMIT = 3;

const targetStatusTopicSlugs = {
  tryingToConceive: 'chuan-bi-mang-thai-thu-thai',
  pregnant: 'thai-ky',
  ivf: 'ivf-ho-tro-sinh-san',
  normal: 'chu-ky-kinh-nguyet',
  periodTracking: 'chu-ky-kinh-nguyet',
  relatives: 'khac',
};

const preferredTopicOrder = [
  'chu-ky-kinh-nguyet',
  'ivf-ho-tro-sinh-san',
  'thai-ky',
  'chuan-bi-mang-thai-thu-thai',
  'khac',
];

const topicHeadingBySlug = {
  'ivf-ho-tro-sinh-san': 'Bài viết về IVF',
  'thai-ky': 'Bài viết về Đang mang thai',
  'chuan-bi-mang-thai-thu-thai': 'Bài viết về chuẩn bị mang thai',
  'chu-ky-kinh-nguyet': 'Bài viết về chu kỳ kinh nguyệt',
  khac: 'Bài viết khác',
};

const getPostImage = (post, topic) => (
  post.thumbnail || post.images?.[0] || topic?.imgThumbnail || blogTopicBanner
);

const getAuthorName = (post) => post.authorId?.fullName || 'HERDAYS';

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('vi-VN');
};

const normalizeSearchValue = (value = '') => (
  value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
);

const getTopicHeading = (topic) => (
  topicHeadingBySlug[topic.slug] || `Bài viết về ${topic.name}`
);

const sortTopics = (topics) => [...topics].sort((a, b) => {
  const aIndex = preferredTopicOrder.indexOf(a.slug);
  const bIndex = preferredTopicOrder.indexOf(b.slug);
  if (aIndex === -1 && bIndex === -1) return a.name.localeCompare(b.name, 'vi');
  if (aIndex === -1) return 1;
  if (bIndex === -1) return -1;
  return aIndex - bIndex;
});

const BlogCard = ({ post, topic, size = 'medium' }) => (
  <Link
    className={`blog-topics-card blog-topics-card--${size}`}
    to={`/blog/${topic._id}/posts/${post._id}`}
  >
    <div className="blog-topics-card__image">
      <img src={getPostImage(post, topic)} alt={post.title} />
    </div>
    <div className="blog-topics-card__content">
      <h3 className="blog-topics-card__title">{post.title}</h3>
      <div className="blog-topics-card__meta">
        <div className="blog-topics-card__author-info">
          <span className="blog-topics-card__avatar">H</span>
          <span className="blog-topics-card__author">{getAuthorName(post)}</span>
        </div>
        <span className="blog-topics-card__date">{formatDate(post.createdAt)}</span>
      </div>
    </div>
  </Link>
);

const BlogSection = ({ title, subtitle, topic, posts, featured = false }) => {
  if (!topic || posts.length === 0) return null;

  return (
    <section className="blog-topics-section">
      <div className="blog-topics-section__header">
        <div className="blog-topics-section__text-center">
          <h2 className="blog-topics-section__title">{title}</h2>
          <p className="blog-topics-section__subtitle">{subtitle}</p>
        </div>
        <Link className="blog-topics-section__link" to={`/blog/${topic._id}/posts`}>
          Xem tất cả <FiChevronRight size={20} />
        </Link>
      </div>
      <div className={`blog-topics-grid ${featured ? 'blog-topics-grid--featured' : 'blog-topics-grid--3cols'}`}>
        {posts.map((post, index) => (
          <BlogCard
            key={post._id}
            post={post}
            topic={topic}
            size={featured && index === 0 ? 'featured' : featured ? 'small' : 'medium'}
          />
        ))}
      </div>
    </section>
  );
};

const BlogTopicsPage = () => {
  const [topics, setTopics] = useState([]);
  const [postsByTopicId, setPostsByTopicId] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [targetStatus, setTargetStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isActive = true;

    const fetchBlogHome = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [topicResult, profileResult] = await Promise.allSettled([
          blogApi.getTopics(),
          hasAuthSession() ? profileApi.getProfile() : Promise.resolve(null),
        ]);

        if (topicResult.status === 'rejected') throw topicResult.reason;

        const nextTopics = sortTopics(topicResult.value.topics || []);
        const postResults = await Promise.all(
          nextTopics.map((topic) => blogApi.getTopicPosts(topic._id, 1, SECTION_POST_LIMIT)),
        );

        if (!isActive) return;

        setTopics(nextTopics);
        setTargetStatus(
          profileResult.status === 'fulfilled'
            ? profileResult.value?.targetStatus || ''
            : '',
        );
        setPostsByTopicId(
          postResults.reduce((acc, result, index) => {
            acc[nextTopics[index]._id] = result.posts || [];
            return acc;
          }, {}),
        );
      } catch (error) {
        if (isActive) setErrorMessage(error.message);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    fetchBlogHome();

    return () => {
      isActive = false;
    };
  }, []);

  const personalizedTopic = useMemo(() => {
    if (!targetStatus || targetStatus === 'partner') return null;
    const preferredSlug = targetStatusTopicSlugs[targetStatus] || preferredTopicOrder[0];
    return topics.find((topic) => topic.slug === preferredSlug) || topics[0] || null;
  }, [targetStatus, topics]);

  const normalizedSearchTerm = useMemo(() => normalizeSearchValue(searchTerm), [searchTerm]);

  const filteredPostsByTopicId = useMemo(() => {
    if (!normalizedSearchTerm) return postsByTopicId;

    return Object.entries(postsByTopicId).reduce((acc, [topicId, posts]) => {
      acc[topicId] = (posts || []).filter((post) => (
        normalizeSearchValue(post.title).includes(normalizedSearchTerm)
      ));
      return acc;
    }, {});
  }, [normalizedSearchTerm, postsByTopicId]);

  const personalizedPosts = personalizedTopic ? filteredPostsByTopicId[personalizedTopic._id] || [] : [];
  const personalizedPreviewPosts = personalizedPosts.slice(0, 3);
  const shouldShowPersonalizedSection = Boolean(personalizedTopic && personalizedPosts.length > 0);

  const visibleTopicSections = useMemo(() => (
    topics.filter((topic) => (
      topic._id !== personalizedTopic?._id
      && (filteredPostsByTopicId[topic._id] || []).length > 0
    ))
  ), [filteredPostsByTopicId, personalizedTopic, topics]);

  const hasBlogContent = shouldShowPersonalizedSection || visibleTopicSections.length > 0;
  const emptyMessage = searchTerm.trim()
    ? `Không tìm thấy bài viết phù hợp với từ khóa "${searchTerm.trim()}".`
    : 'Chưa có bài viết nào được xuất bản.';

  return (
    <div className="blog-topics-page">
      <div className="blog-topics-banner">
        <img src={blogTopicBanner} alt="Blog Topics Banner" className="blog-topics-banner__image" />
      </div>

      <div className="blog-topics-container">
        <div className="blog-topics-search" role="search">
          <label className="blog-topics-search__label" htmlFor="blog-topics-search-input">
            Tìm kiếm bài viết
          </label>
          <div className="blog-topics-search__control">
            <FiSearch className="blog-topics-search__icon" size={20} />
            <input
              id="blog-topics-search-input"
              className="blog-topics-search__input"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Nhập tên bài viết..."
            />
            {searchTerm && (
              <button
                type="button"
                className="blog-topics-search__clear"
                onClick={() => setSearchTerm('')}
                aria-label="Xóa tìm kiếm"
              >
                <FiX size={18} />
              </button>
            )}
          </div>
        </div>

        {isLoading && <LoadingState label="Đang tải bài viết..." />}
        {!isLoading && errorMessage && <ErrorState message={errorMessage} />}
        {!isLoading && !errorMessage && !hasBlogContent && (
          <EmptyState message={emptyMessage} />
        )}
        {!isLoading && !errorMessage && hasBlogContent && (
          <>
            {shouldShowPersonalizedSection && (
              <BlogSection
                featured
                title="Dành cho bạn"
                subtitle={`Bài viết phù hợp với chủ đề ${personalizedTopic.name}.`}
                topic={personalizedTopic}
                posts={personalizedPreviewPosts}
              />
            )}

            {visibleTopicSections.map((topic) => (
              <BlogSection
                key={topic._id}
                title={getTopicHeading(topic)}
                subtitle={topic.description}
                topic={topic}
                posts={filteredPostsByTopicId[topic._id] || []}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogTopicsPage;
