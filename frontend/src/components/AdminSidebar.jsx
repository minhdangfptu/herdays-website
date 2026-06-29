import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Store,
  BotMessageSquare,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./AdminSidebar.scss";
import adminSilk from "../assets/admin_sidebar_silk.png";

const navItems = [
  { icon: LayoutDashboard, label: "Tổng quan", to: "/admin" },
  { icon: BookOpen, label: "Bài viết", to: "/admin/blog" },
  { icon: Store, label: "Cửa hàng", to: "/admin/shop" },
  { icon: BotMessageSquare, label: "HerbotAI", to: "/admin/herbotai" },
  { icon: Users, label: "Người dùng", to: "/admin/users" },
];

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Silk Banner */}
      <div className="admin-sidebar-silk">
        <img src={adminSilk} alt="Herdays Admin" className="silk-image" />
        <div className="silk-overlay">
          <span className="silk-brand">HERDAYS</span>
          <span className="silk-role">Quản trị viên</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="admin-sidebar-nav">
        <ul className="admin-nav-list">
          {navItems.map(({ icon: Icon, label, to }) => (
            <li key={to} className="admin-nav-item">
              <NavLink
                to={to}
                end={to === "/admin"}
                className={({ isActive }) =>
                  `admin-nav-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={20} strokeWidth={1.8} className="admin-nav-icon" />
                {!collapsed && <span className="admin-nav-label">{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <button
        className="admin-sidebar-toggle"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Mở rộng" : "Thu gọn"}
      >
        {collapsed ? (
          <ChevronRight size={16} strokeWidth={2} />
        ) : (
          <ChevronLeft size={16} strokeWidth={2} />
        )}
      </button>
    </aside>
  );
};

export default AdminSidebar;
