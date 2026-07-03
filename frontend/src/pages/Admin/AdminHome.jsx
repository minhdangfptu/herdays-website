import { useEffect, useMemo, useState } from 'react';
import { FaUsers, FaShoppingCart, FaFileAlt, FaCheckCircle, FaSearch } from 'react-icons/fa';

import { adminApi, blogApi } from '../../services/apiService.js';
import './AdminHome.scss';

const getTotal = (pagination) => (
  pagination?.total ?? pagination?.totalItems ?? 0
);

const getSettledValue = (result, fallback) => (
  result.status === 'fulfilled' ? result.value : fallback
);

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('vi-VN');
};

export default function AdminHome() {
  const [selectedTab, setSelectedTab] = useState('new');
  const [dashboard, setDashboard] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    unverifiedUsers: 0,
    totalContacts: 0,
    respondedContacts: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalTopics: 0,
    totalPosts: 0,
    latestPosts: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isActive = true;

    const fetchDashboard = async () => {
      setIsLoading(true);
      setErrorMessage('');

      const results = await Promise.allSettled([
        adminApi.getUsers({ page: 1, limit: 1 }),
        adminApi.getUsers({ page: 1, limit: 1, role: 'admin' }),
        adminApi.getUsers({ page: 1, limit: 1, isVerified: false }),
        adminApi.getContacts({ page: 1, limit: 1 }),
        adminApi.getContacts({ page: 1, limit: 1, isRessponsed: true }),
        adminApi.getOrderStats(),
        adminApi.getProducts({ page: 1, limit: 1 }),
        blogApi.getTopics(),
        blogApi.getAdminPosts({ page: 1, limit: 5 }),
      ]);

        if (!isActive) return;

        const users = getSettledValue(results[0], { pagination: {} });
        const admins = getSettledValue(results[1], { pagination: {} });
        const unverified = getSettledValue(results[2], { pagination: {} });
        const contacts = getSettledValue(results[3], { pagination: {} });
        const responded = getSettledValue(results[4], { pagination: {} });
        const orderStats = getSettledValue(results[5], {});
        const products = getSettledValue(results[6], { pagination: {} });
        const topics = getSettledValue(results[7], { topics: [] });
        const posts = getSettledValue(results[8], { posts: [], pagination: {} });

        setDashboard({
          totalUsers: getTotal(users.pagination),
          totalAdmins: getTotal(admins.pagination),
          unverifiedUsers: getTotal(unverified.pagination),
          totalContacts: getTotal(contacts.pagination),
          respondedContacts: getTotal(responded.pagination),
          totalProducts: getTotal(products.pagination),
          totalOrders: orderStats.total || 0,
          pendingOrders: orderStats.pending || 0,
          totalTopics: topics.topics?.length || 0,
          totalPosts: getTotal(posts.pagination),
          latestPosts: posts.posts || [],
        });

        const failed = results.find((result) => result.status === 'rejected');
        if (failed) setErrorMessage(failed.reason?.message || 'Không thể tải toàn bộ số liệu.');

      if (isActive) setIsLoading(false);
    };

    fetchDashboard();

    return () => {
      isActive = false;
    };
  }, []);

  const stats = [
    {
      id: 1,
      icon: FaUsers,
      label: 'Tổng số người dùng',
      value: dashboard.totalUsers,
      change: `${dashboard.unverifiedUsers} chờ xác thực`,
      changeColor: dashboard.unverifiedUsers > 0 ? 'red' : 'gray',
      bgColor: '#E3F2FD',
    },
    {
      id: 2,
      icon: FaShoppingCart,
      label: 'Tổng số đơn hàng',
      value: dashboard.totalOrders,
      change: `${dashboard.pendingOrders} đang chờ xác nhận`,
      changeColor: dashboard.pendingOrders > 0 ? 'red' : 'gray',
      bgColor: '#FCE4EC',
    },
    {
      id: 3,
      icon: FaFileAlt,
      label: 'Chủ đề / Bài viết',
      value: `${dashboard.totalTopics} / ${dashboard.totalPosts}`,
      change: 'Dữ liệu blog hiện có',
      changeColor: 'green',
      bgColor: '#F3E5F5',
    },
    {
      id: 4,
      icon: FaCheckCircle,
      label: 'Liên hệ đã phản hồi',
      value: dashboard.respondedContacts,
      change: `${dashboard.totalContacts} tổng liên hệ`,
      changeColor: 'gray',
      bgColor: '#F5F5F5',
    },
  ];

  const userManagementData = [
    { info: 'Tổng user', number: dashboard.totalUsers, notes: `${dashboard.unverifiedUsers} chờ xác thực` },
    { info: 'Tổng admin', number: dashboard.totalAdmins, notes: '' },
    { info: 'Tổng liên hệ', number: dashboard.totalContacts, notes: `${dashboard.respondedContacts} đã phản hồi` },
  ];

  const marketplaceData = [
    { info: 'Sản phẩm / combo', number: dashboard.totalProducts },
    { info: 'Tổng đơn hàng', number: dashboard.totalOrders },
    { info: 'Đơn hàng đang chờ xác nhận', number: dashboard.pendingOrders },
  ];

  const visiblePosts = useMemo(() => (
    selectedTab === 'old'
      ? [...dashboard.latestPosts].reverse()
      : dashboard.latestPosts
  ), [dashboard.latestPosts, selectedTab]);

  return (
    <div className="admin-home">
      <div className="admin-home-inner">
        <div className="admin-home-header">
          <div className="admin-home-title-section">
            <h1 className="admin-home-title">Tổng quan</h1>
            <p className="admin-home-subtitle">
              {isLoading ? 'Đang tải số liệu...' : 'Tổng quan hệ thống HERDAYS'}
            </p>
            {errorMessage && <p className="admin-home-subtitle">{errorMessage}</p>}
          </div>
          <div className="admin-home-search">
            <FaSearch className="admin-home-search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              className="admin-home-search-input"
            />
          </div>
        </div>

        <div className="admin-home-stats">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div key={stat.id} className="admin-home-stat-card">
                <div className="admin-home-stat-icon" style={{ backgroundColor: stat.bgColor }}>
                  <IconComponent size={28} />
                </div>
                <div className="admin-home-stat-content">
                  <p className="admin-home-stat-label">{stat.label}</p>
                  <h3 className="admin-home-stat-value">{stat.value}</h3>
                  <p className={`admin-home-stat-change admin-home-stat-change-${stat.changeColor}`}>
                    {stat.change}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="admin-home-tables-container">
          <div className="admin-home-table-wrapper">
            <div className="admin-home-table-header">
              <div className="admin-home-table-title-area">
                <div className="admin-home-table-alert-icon">!</div>
                <h3 className="admin-home-table-title">Quản lý người dùng - liên hệ</h3>
              </div>
            </div>
            <table className="admin-home-table">
              <thead>
                <tr>
                  <th>Thông tin</th>
                  <th>Số liệu</th>
                  <th>Khác</th>
                </tr>
              </thead>
              <tbody>
                {userManagementData.map((row) => (
                  <tr key={row.info}>
                    <td>{row.info}</td>
                    <td>{row.number}</td>
                    <td>{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-home-table-wrapper">
            <h3 className="admin-home-table-title">Số liệu Marketplace</h3>
            <table className="admin-home-table">
              <thead>
                <tr>
                  <th>Thông tin</th>
                  <th>Số liệu</th>
                </tr>
              </thead>
              <tbody>
                {marketplaceData.map((row) => (
                  <tr key={row.info}>
                    <td>{row.info}</td>
                    <td>{row.number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-home-posts-section">
          <div className="admin-home-posts-header">
            <h3 className="admin-home-posts-title">Bài viết mới nhất</h3>
            <div className="admin-home-posts-tabs">
              <button
                className={`admin-home-posts-tab ${selectedTab === 'new' ? 'active' : ''}`}
                type="button"
                onClick={() => setSelectedTab('new')}
              >
                Mới tạo
              </button>
              <button
                className={`admin-home-posts-tab ${selectedTab === 'old' ? 'active' : ''}`}
                type="button"
                onClick={() => setSelectedTab('old')}
              >
                Cũ nhất
              </button>
            </div>
          </div>
          <div className="admin-home-posts-list">
            {visiblePosts.length === 0 && (
              <div className="admin-home-post-item">
                <div className="admin-home-post-info">
                  <h4 className="admin-home-post-title">Chưa có bài viết</h4>
                  <p className="admin-home-post-meta">Dữ liệu sẽ hiển thị khi admin tạo bài viết.</p>
                </div>
              </div>
            )}
            {visiblePosts.map((post) => (
              <div key={post._id} className="admin-home-post-item">
                <div className="admin-home-post-info">
                  <h4 className="admin-home-post-title">{post.title}</h4>
                  <p className="admin-home-post-meta">
                    Người tạo: {post.authorId?.fullName || 'HERDAYS'} | Chủ đề: {post.postTopicId?.name || 'Chưa phân loại'}
                  </p>
                  <p className="admin-home-post-date">{formatDate(post.createdAt)}</p>
                </div>
                <div className="admin-home-post-actions">
                  <span className="admin-home-post-action-link">{post.status || 'Draft'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
