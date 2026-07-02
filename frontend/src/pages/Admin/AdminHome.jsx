import React, { useState } from 'react';
import { FaUsers, FaShoppingCart, FaFileAlt, FaCheckCircle, FaSearch } from 'react-icons/fa';
import './AdminHome.scss';

export default function AdminHome() {
  const [selectedTab, setSelectedTab] = useState('new');

  const stats = [
    {
      id: 1,
      icon: FaUsers,
      label: 'Tổng số người dùng',
      value: '23',
      change: '+3 trong tuần này',
      changeColor: 'green',
      bgColor: '#E3F2FD'
    },
    {
      id: 2,
      icon: FaShoppingCart,
      label: 'Tổng số đơn hàng',
      value: '2',
      change: '+1 trong tuần này',
      changeColor: 'red',
      bgColor: '#FCE4EC'
    },
    {
      id: 3,
      icon: FaFileAlt,
      label: 'Tổng số Chủ đề / Tổng số Bài viết',
      value: '41',
      change: '+5 trong tuần này',
      changeColor: 'green',
      bgColor: '#F3E5F5'
    },
    {
      id: 4,
      icon: FaCheckCircle,
      label: 'Liên hệ đã được confirm',
      value: '1',
      change: '= trong tuần này',
      changeColor: 'gray',
      bgColor: '#F5F5F5'
    }
  ];

  const userManagementData = [
    { info: 'Tổng user', number: 23, notes: '3 chờ xác thực' },
    { info: 'Tổng admin', number: 3, notes: '' },
    { info: 'Tổng liên hệ', number: '—', notes: 'Phạm Thụy Linh  3 chờ Confirm' }
  ];

  const marketplaceData = [
    { info: 'Sản phẩm', number: 24 },
    { info: 'Tổng đơn hàng', number: 3 },
    { info: 'Đơn hàng đang chờ confirm', number: 2 }
  ];

  const latestPosts = [
    {
      id: 1,
      title: 'Cách xịnh gái tính quái',
      author: 'Admin_Hương Ly',
      category: 'IVF',
      date: '15/11/2024',
      action: 'Mới tạo'
    },
    {
      id: 2,
      title: 'Cách ăn du dủ không cần thia',
      author: 'Admin_Quỳ Hoàng',
      category: 'IVF',
      date: '18/11/2024',
      action: 'Mới tạo'
    },
    {
      id: 3,
      title: 'Cách hỗi tăng lương mà k ăn đâm',
      author: 'Admin_Minh Dũng',
      category: 'IVF',
      date: '20/11/2024',
      action: 'Mới tạo'
    }
  ];

  return (
    <div className="admin-home">
      <div className="admin-home-inner">
      <div className="admin-home-header">
        <div className="admin-home-title-section">
          <h1 className="admin-home-title">Tổng quan</h1>
          <p className="admin-home-subtitle">Tổng quan</p>
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

      {/* Stats Cards */}
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

      {/* Tables Section */}
      <div className="admin-home-tables-container">
        {/* User Management Table */}
        <div className="admin-home-table-wrapper">
          <div className="admin-home-table-header">
            <div className="admin-home-table-title-area">
              <div className="admin-home-table-alert-icon">⚠️</div>
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
              {userManagementData.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.info}</td>
                  <td>{row.number}</td>
                  <td>{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Marketplace Table */}
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
              {marketplaceData.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.info}</td>
                  <td>{row.number}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Latest Posts Section */}
      <div className="admin-home-posts-section">
        <div className="admin-home-posts-header">
          <h3 className="admin-home-posts-title">Bài viết mới nhất</h3>
          <div className="admin-home-posts-tabs">
            <button
              className={`admin-home-posts-tab ${selectedTab === 'new' ? 'active' : ''}`}
              onClick={() => setSelectedTab('new')}
            >
              Mới tạo
            </button>
            <button
              className={`admin-home-posts-tab ${selectedTab === 'old' ? 'active' : ''}`}
              onClick={() => setSelectedTab('old')}
            >
              Cũ nhất
            </button>
          </div>
        </div>
        <div className="admin-home-posts-list">
          {latestPosts.map((post) => (
            <div key={post.id} className="admin-home-post-item">
              <div className="admin-home-post-info">
                <h4 className="admin-home-post-title">{post.title}</h4>
                <p className="admin-home-post-meta">
                  Người tạo: {post.author} | Chủ đề: {post.category}
                </p>
                <p className="admin-home-post-date">📅 {post.date}</p>
              </div>
              <div className="admin-home-post-actions">
                <span className="admin-home-post-action-link">Mới tạo</span>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}
