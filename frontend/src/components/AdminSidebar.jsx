import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Store,
  Package,
  ReceiptText,
  BotMessageSquare,
  Users,
  Mail,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import "./AdminSidebar.scss";
import adminSilk from "../assets/admin_sidebar_silk.png";
import { authApi, clearAuthSession } from "../services/apiService.js";

const navItems = [
  { icon: LayoutDashboard, label: "Tổng quan", to: "/admin" },
  { icon: BookOpen, label: "Bài viết", to: "/admin/blog" },
  {
    icon: Store,
    label: "Cửa hàng",
    to: "/admin/marketplace/products",
    children: [
      { icon: Package, label: "Quản lý Sản phẩm", to: "/admin/marketplace/products" },
      { icon: ReceiptText, label: "Quản lý Đơn hàng", to: "/admin/marketplace/orders" },
    ],
  },
  { icon: Users, label: "Người dùng", to: "/admin/users" },
  { icon: Mail, label: "Quản lý Liên hệ", to: "/admin/contacts" },
];

const AdminSidebar = ({ collapsed, onToggleCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Clear local session even when the refresh token is already invalid.
    } finally {
      clearAuthSession();
      navigate("/login", { replace: true });
    }
  };

  const renderNavItem = ({ icon: Icon, label, to, children }) => {
    if (children?.length) {
      const isGroupActive = children.some((child) => location.pathname.startsWith(child.to));

      return (
        <li key={to} className="admin-nav-item">
          <div className={`admin-nav-group ${isGroupActive ? "active" : ""}`}>
            <NavLink
              to={to}
              title={collapsed ? label : undefined}
              className="admin-nav-link admin-nav-parent"
            >
              <Icon size={20} strokeWidth={1.8} className="admin-nav-icon" />
              {!collapsed && <span className="admin-nav-label">{label}</span>}
              {!collapsed && <ChevronDown size={14} strokeWidth={2} className="admin-nav-chevron" />}
            </NavLink>
            {!collapsed && (
              <ul className="admin-nav-sublist">
                {children.map(({ icon: ChildIcon, label: childLabel, to: childTo }) => (
                  <li key={childTo}>
                    <NavLink
                      to={childTo}
                      className={({ isActive }) =>
                        `admin-nav-sublink ${isActive ? "active" : ""}`
                      }
                    >
                      <ChildIcon size={15} strokeWidth={1.8} />
                      <span>{childLabel}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
      );
    }

    return (
      <li key={to} className="admin-nav-item">
        <NavLink
          to={to}
          end={to === "/admin"}
          title={collapsed ? label : undefined}
          className={({ isActive }) =>
            `admin-nav-link ${isActive ? "active" : ""}`
          }
        >
          <Icon size={20} strokeWidth={1.8} className="admin-nav-icon" />
          {!collapsed && <span className="admin-nav-label">{label}</span>}
        </NavLink>
      </li>
    );
  };

  return (
    <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="admin-sidebar-silk">
        <img src={adminSilk} alt="Herdays Admin" className="silk-image" />
        <div className="silk-overlay">
          <span className="silk-brand">HERDAYS</span>
          <span className="silk-role">Quản trị viên</span>
        </div>
      </div>

      <button
        className="admin-sidebar-toggle"
        type="button"
        onClick={onToggleCollapsed}
        aria-label={collapsed ? "Mở rộng" : "Thu gọn"}
      >
        {collapsed ? (
          <ChevronRight size={16} strokeWidth={2} />
        ) : (
          <ChevronLeft size={16} strokeWidth={2} />
        )}
      </button>

      <nav className="admin-sidebar-nav">
        <ul className="admin-nav-list">{navItems.map(renderNavItem)}</ul>
      </nav>

      <div className="admin-sidebar-footer">
        <button
          className="admin-logout-button"
          type="button"
          onClick={handleLogout}
          title={collapsed ? "Đăng xuất" : undefined}
          aria-label="Đăng xuất"
        >
          <LogOut size={20} strokeWidth={1.8} className="admin-nav-icon" />
          {!collapsed && <span className="admin-logout-label">Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
