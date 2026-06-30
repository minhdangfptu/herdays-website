import React, { useState } from 'react';
import { FiChevronRight } from 'react-icons/fi';
import './BlogTopicsPage.scss';
import blog_topic_banner from '../../assets/blog_topic_banner.png';

const BlogTopicsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const forYouPosts = [
    {
      id: 1,
      title: 'Chu kỳ kinh nguyệt bao nhiêu ngày là bình thường?',
      author: 'Admin_Quy Hoàng',
      date: 'Nov 29, 2024',
      image: 'https://via.placeholder.com/200x150?text=Calendar1'
    },
    {
      id: 2,
      title: 'Chu kỳ kinh nguyệt bao nhiêu ngày là bình thường?',
      author: 'Admin_Quy Hoàng',
      date: 'Nov 29, 2024',
      image: 'https://via.placeholder.com/200x150?text=Calendar2'
    },
    {
      id: 3,
      title: 'Chu kỳ kinh nguyệt bao nhiêu ngày là bình thường?',
      author: 'Admin_Quy Hoàng',
      date: 'Nov 29, 2024',
      image: 'https://via.placeholder.com/200x150?text=Calendar3'
    }
  ];

  const ivfPosts = [
    {
      id: 1,
      title: 'IVF Là Gì? Hiểu Đúng Về Thụ Tinh Trong Ống Nghiệm Để Vượt Tin Trên Hành Trình Tìm ...',
      author: 'Admin_Quy Hoàng',
      date: 'Nov 29, 2024',
      image: 'https://via.placeholder.com/250x180?text=IVF1'
    },
    {
      id: 2,
      title: 'IVF Là Gì? Hiểu Đúng Về Thụ Tinh Trong Ống Nghiệm Để Vượt Tin Trên Hành Trình Tìm ...',
      author: 'Admin_Quy Hoàng',
      date: 'Nov 29, 2024',
      image: 'https://via.placeholder.com/250x180?text=IVF2'
    },
    {
      id: 3,
      title: 'IVF Là Gì? Hiểu Đúng Về Thụ Tinh Trong Ống Nghiệm Để Vượt Tin Trên Hành Trình Tìm ...',
      author: 'Admin_Quy Hoàng',
      date: 'Nov 29, 2024',
      image: 'https://via.placeholder.com/250x180?text=IVF3'
    }
  ];

  const pregnancyPosts = [
    {
      id: 1,
      title: 'Thai Kỳ 40 Tuần: Hành Trình Kỳ Diệu Của Mẹ Và Bé Qua Từng Giai Đoạn',
      author: 'Admin_Quy Hoàng',
      date: 'Nov 29, 2024',
      image: 'https://via.placeholder.com/250x180?text=Pregnancy1'
    },
    {
      id: 2,
      title: 'Thai Kỳ 40 Tuần: Hành Trình Kỳ Diệu Của Mẹ Và Bé Qua Từng Giai Đoạn',
      author: 'Admin_Quy Hoàng',
      date: 'Nov 29, 2024',
      image: 'https://via.placeholder.com/250x180?text=Pregnancy2'
    },
    {
      id: 3,
      title: 'Thai Kỳ 40 Tuần: Hành Trình Kỳ Diệu Của Mẹ Và Bé Qua Từng Giai Đoạn',
      author: 'Admin_Quy Hoàng',
      date: 'Nov 29, 2024',
      image: 'https://via.placeholder.com/250x180?text=Pregnancy3'
    }
  ];

  const BlogCard = ({ post, size = 'medium' }) => (
    <div className={`blog-topics-card blog-topics-card--${size}`}>
      <div className="blog-topics-card__image">
        <img src={post.image} alt={post.title} />
      </div>
      <div className="blog-topics-card__content">
        <h3 className="blog-topics-card__title">{post.title}</h3>
        <div className="blog-topics-card__meta">
          <div className="blog-topics-card__author-info">
            <img src="https://via.placeholder.com/24x24?text=Avatar" alt="Avatar" className="blog-topics-card__avatar" />
            <span className="blog-topics-card__author">{post.author}</span>
          </div>
          <span className="blog-topics-card__date">{post.date}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="blog-topics-page">
      {/* Banner */}
      <div className="blog-topics-banner">
        <img src={blog_topic_banner} alt="Blog Topics Banner" className="blog-topics-banner__image" />
      </div>

      {/* Main Content */}
      <div className="blog-topics-container">
        {/* For You Section */}
        <section className="blog-topics-section">
          <div className="blog-topics-section__header">
            <div className="blog-topics-section__text-center">
              <h2 className="blog-topics-section__title">Dành cho bạn</h2>
              <p className="blog-topics-section__subtitle">Bài viết dành cho bạn. Đặng trong chu kỳ kinh nguyệt!</p>
            </div>
            <a href="#" className="blog-topics-section__link">
              Xem tất cả <FiChevronRight size={20} />
            </a>
          </div>
          <div className="blog-topics-grid blog-topics-grid--featured">
            {forYouPosts.map((post, index) => (
              <BlogCard key={post.id} post={post} size={index === 0 ? 'featured' : 'small'} />
            ))}
          </div>
        </section>

        {/* IVF Section */}
        <section className="blog-topics-section">
          <div className="blog-topics-section__header">
            <div className="blog-topics-section__text-center">
              <h2 className="blog-topics-section__title">Bài viết về IVF</h2>
              <p className="blog-topics-section__subtitle">Bài viết về hành trình IVF</p>
            </div>
            <a href="#" className="blog-topics-section__link">
              Xem tất cả <FiChevronRight size={20} />
            </a>
          </div>
          <div className="blog-topics-grid blog-topics-grid--3cols">
            {ivfPosts.map(post => (
              <BlogCard key={post.id} post={post} size="medium" />
            ))}
          </div>
        </section>

        {/* Pregnancy Section */}
        <section className="blog-topics-section">
          <div className="blog-topics-section__header">
            <div className="blog-topics-section__text-center">
              <h2 className="blog-topics-section__title">Bài viết về Đang mang thai</h2>
              <p className="blog-topics-section__subtitle">Bài viết về hành trình Đang mang thai</p>
            </div>
            <a href="#" className="blog-topics-section__link">
              Xem tất cả <FiChevronRight size={20} />
            </a>
          </div>
          <div className="blog-topics-grid blog-topics-grid--3cols">
            {pregnancyPosts.map(post => (
              <BlogCard key={post.id} post={post} size="medium" />
            ))}
          </div>
        </section>

        {/* Pagination */}
        <div className="blog-topics-pagination">
          <button 
            className="blog-topics-pagination__btn blog-topics-pagination__btn--active"
            onClick={() => setCurrentPage(1)}
          >
            1
          </button>
          <button 
            className="blog-topics-pagination__btn"
            onClick={() => setCurrentPage(2)}
          >
            2
          </button>
          <button 
            className="blog-topics-pagination__btn"
            onClick={() => setCurrentPage(3)}
          >
            3
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogTopicsPage;
