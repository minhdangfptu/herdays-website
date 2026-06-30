import { useState } from 'react';
import './BlogPostsPage.scss';

const BlogPostsPage = () => {
  const setCurrentPage = useState(1)[1];

  const posts = [
    {
      id: 1,
      title: 'Chu kỳ kinh nguyệt bao nhiêu ngày là bình thường?',
      author: 'Admin_Quy Hoàng',
      date: 'Nov 29, 2024',
      image: 'https://via.placeholder.com/400x260?text=Post1'
    },
    {
      id: 2,
      title: 'IVF Là Gì? Hiểu Đúng Về Thụ Tinh Trong Ống Nghiệm Để Vượt Tin Trên Hành Trình Tìm ...',
      author: 'Admin_Quy Hoàng',
      date: 'Nov 29, 2024',
      image: 'https://via.placeholder.com/400x260?text=Post2'
    },
    {
      id: 3,
      title: 'Thai Kỳ 40 Tuần: Hành Trình Kỳ Diệu Của Mẹ Và Bé Qua Từng Giai Đoạn',
      author: 'Admin_Quy Hoàng',
      date: 'Nov 29, 2024',
      image: 'https://via.placeholder.com/400x260?text=Post3'
    },
    {
      id: 4,
      title: 'Chu kỳ kinh nguyệt bao nhiêu ngày là bình thường?',
      author: 'Admin_Quy Hoàng',
      date: 'Nov 29, 2024',
      image: 'https://via.placeholder.com/400x260?text=Post4'
    },
    {
      id: 5,
      title: 'IVF Là Gì? Hiểu Đúng Về Thụ Tinh Trong Ống Nghiệm Để Vượt Tin Trên Hành Trình Tìm ...',
      author: 'Admin_Quy Hoàng',
      date: 'Nov 29, 2024',
      image: 'https://via.placeholder.com/400x260?text=Post5'
    },
    {
      id: 6,
      title: 'Thai Kỳ 40 Tuần: Hành Trình Kỳ Diệu Của Mẹ Và Bé Qua Từng Giai Đoạn',
      author: 'Admin_Quy Hoàng',
      date: 'Nov 29, 2024',
      image: 'https://via.placeholder.com/400x260?text=Post6'
    },
    {
      id: 7,
      title: 'Chu kỳ kinh nguyệt bao nhiêu ngày là bình thường?',
      author: 'Admin_Quy Hoàng',
      date: 'Nov 29, 2024',
      image: 'https://via.placeholder.com/400x260?text=Post7'
    },
    {
      id: 8,
      title: 'IVF Là Gì? Hiểu Đúng Về Thụ Tinh Trong Ống Nghiệm Để Vượt Tin Trên Hành Trình Tìm ...',
      author: 'Admin_Quy Hoàng',
      date: 'Nov 29, 2024',
      image: 'https://via.placeholder.com/400x260?text=Post8'
    },
    {
      id: 9,
      title: 'Thai Kỳ 40 Tuần: Hành Trình Kỳ Diệu Của Mẹ Và Bé Qua Từng Giai Đoạn',
      author: 'Admin_Quy Hoàng',
      date: 'Nov 29, 2024',
      image: 'https://via.placeholder.com/400x260?text=Post9'
    }
  ];

  const relatedPosts = [
    {
      id: 101,
      title: 'Chu kỳ kinh nguyệt bao nhiêu ngày là bình thường?',
      author: 'Admin_Quy Hoàng',
      date: 'Nov 29, 2024',
      image: 'https://via.placeholder.com/120x90?text=R1'
    },
    {
      id: 102,
      title: 'IVF Là Gì? Hiểu Đúng Về Thụ Tinh Trong Ống Nghiệm',
      author: 'Admin_Quy Hoàng',
      date: 'Nov 29, 2024',
      image: 'https://via.placeholder.com/120x90?text=R2'
    },
    {
      id: 103,
      title: 'Thai Kỳ 40 Tuần: Hành Trình Kỳ Diệu Của Mẹ Và Bé',
      author: 'Admin_Quy Hoàng',
      date: 'Nov 29, 2024',
      image: 'https://via.placeholder.com/120x90?text=R3'
    },
    {
      id: 104,
      title: 'Chu kỳ kinh nguyệt bao nhiêu ngày là bình thường?',
      author: 'Admin_Quy Hoàng',
      date: 'Nov 29, 2024',
      image: 'https://via.placeholder.com/120x90?text=R4'
    }
  ];

  const MainPostCard = ({ post }) => (
    <article className="blog-posts-main-card">
      <div className="blog-posts-main-card__image">
        <img src={post.image} alt={post.title} />
      </div>
      <div className="blog-posts-main-card__content">
        <h3 className="blog-posts-main-card__title">{post.title}</h3>
        <div className="blog-posts-main-card__meta">
          <div className="blog-posts-main-card__author-info">
            <img
              src="https://via.placeholder.com/24x24?text=Avatar"
              alt="Avatar"
              className="blog-posts-main-card__avatar"
            />
            <span className="blog-posts-main-card__author">{post.author}</span>
          </div>
          <span className="blog-posts-main-card__date">{post.date}</span>
        </div>
      </div>
    </article>
  );

  const RelatedCard = ({ post }) => (
    <article className="blog-posts-related-card">
      <div className="blog-posts-related-card__image">
        <img src={post.image} alt={post.title} />
      </div>
      <div className="blog-posts-related-card__content">
        <h4 className="blog-posts-related-card__title">{post.title}</h4>
        <div className="blog-posts-related-card__meta">
          <span className="blog-posts-related-card__author">{post.author}</span>
          <span className="blog-posts-related-card__date">{post.date}</span>
        </div>
      </div>
    </article>
  );

  return (
    <div className="blog-posts-page">
      {/* Banner */}
      <div className="blog-posts-banner">
        <div className="blog-posts-banner__inner">
          <h1 className="blog-posts-banner__title">Các bài viết dành cho bạn</h1>
          <p className="blog-posts-banner__subtitle">
            Các bài viết chủ đề: chu kỳ kinh nguyệt
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="blog-posts-container">
        <div className="blog-posts-layout">
          {/* Left Column - Main Posts List (2/3) */}
          <div className="blog-posts-main">
            {posts.map((post) => (
              <MainPostCard key={post.id} post={post} />
            ))}

            {/* Pagination */}
            <div className="blog-posts-pagination">
              <button
                className="blog-posts-pagination__btn blog-posts-pagination__btn--active"
                onClick={() => setCurrentPage(1)}
              >
                1
              </button>
              <button
                className="blog-posts-pagination__btn"
                onClick={() => setCurrentPage(2)}
              >
                2
              </button>
              <button
                className="blog-posts-pagination__btn"
                onClick={() => setCurrentPage(3)}
              >
                3
              </button>
            </div>
          </div>

          {/* Right Column - Related Posts (1/3) */}
          <aside className="blog-posts-sidebar">
            <h2 className="blog-posts-sidebar__title">Bài viết liên quan</h2>
            <div className="blog-posts-sidebar__list">
              {relatedPosts.map((post) => (
                <RelatedCard key={post.id} post={post} />
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BlogPostsPage;
