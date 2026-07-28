import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { CircleUserRound, Lock, LogOut, ShoppingBag, Star, UserRound } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import toast from "react-hot-toast";
import "./Header.scss";
import logoTrang from "../assets/home/logo_trang.png";
import {
  CART_STATE_CHANGE_EVENT,
  authApi,
  cartApi,
  clearAuthSession,
  getCartItemCount,
  hasAuthSession
} from "../services/apiService.js";
import LogoutModal from "./LogoutModal.jsx";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(hasAuthSession());
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();

  const authProvider = localStorage.getItem('authProvider');
  const canChangePassword = authProvider === 'local';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    let isMounted = true;

    const loadCartItemCount = async () => {
      if (!hasAuthSession()) {
        if (isMounted) setCartItemCount(0);
        return;
      }

      try {
        const cart = await cartApi.getCart();
        if (isMounted) setCartItemCount(getCartItemCount(cart));
      } catch {
        if (isMounted) setCartItemCount(0);
      }
    };

    const handleAuthChanged = () => {
      const nextIsLoggedIn = hasAuthSession();
      setIsLoggedIn(nextIsLoggedIn);

      if (nextIsLoggedIn) {
        loadCartItemCount();
      } else {
        setCartItemCount(0);
      }
    };

    const handleCartChanged = (event) => {
      if (!hasAuthSession()) {
        setCartItemCount(0);
        return;
      }

      const nextItemCount = event.detail?.itemCount;
      if (Number.isFinite(nextItemCount)) {
        setCartItemCount(nextItemCount);
        return;
      }

      loadCartItemCount();
    };

    handleAuthChanged();
    window.addEventListener("auth-state-change", handleAuthChanged);
    window.addEventListener("storage", handleAuthChanged);
    window.addEventListener(CART_STATE_CHANGE_EVENT, handleCartChanged);
    return () => {
      isMounted = false;
      window.removeEventListener("auth-state-change", handleAuthChanged);
      window.removeEventListener("storage", handleAuthChanged);
      window.removeEventListener(CART_STATE_CHANGE_EVENT, handleCartChanged);
    };
  }, []);

  useEffect(() => {
    if (!isProfileMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    try {
      await authApi.logout();
    } catch {
      // Local session must still be cleared when the server token is already expired.
    } finally {
      clearAuthSession();
      toast.success("Đăng xuất thành công. Hẹn gặp lại bạn!");
      navigate("/", { replace: true });
    }
  };

  const loggedOutMenuItems = [
    { label: "Trang chủ", to: "/home" },
    { label: "Tải ứng dụng", to: "/download-app" },
    { label: "Liên hệ", to: "/contact-us" },
    { label: "Về chúng tôi", to: "/about-us" },
  ];

  const loggedInMenuItems = [
    { label: "Trang chủ", to: "/home" },
    { label: "Bài viết", to: "/blog" },
    { label: "Cửa hàng", to: "/marketplace" },
    { label: "HerBotAI", to: "/chat-with-herbot" },
    { label: "Tải ứng dụng", to: "/download-app" },
    { label: "Công cụ", to: "/tools" },
  ];

  const menuItems = isLoggedIn ? loggedInMenuItems : loggedOutMenuItems;

  return (
    <>
      <header className="header">
        <div className="header-container">
          <div className="header-logo">
            <Link to="/home">
              <img src={logoTrang} alt="HERDAYS" className="logo-image" />
            </Link>
          </div>

          <nav className={`header-nav ${isMenuOpen ? "active" : ""}`} onClick={() => setIsMenuOpen(false)}>
            <ul className="nav-list">
              {menuItems.map((item) => (
                <li key={item.label} className="nav-item">
                  {item.isDisabled ? (
                    <span className="nav-link" aria-disabled="true">{item.label}</span>
                  ) : (
                    <NavLink
                      to={item.to}
                      end={item.to === "/home"}
                      className={({ isActive }) =>
                        item.to !== "#" && isActive ? "nav-link active" : "nav-link"
                      }
                    >
                      {item.label}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>

            {!isLoggedIn && (
              <div className="header-nav-auth">
                <Link className="btn-signup" to="/login">Đăng nhập</Link>
                <Link className="btn-login" to="/register">Đăng ký</Link>
              </div>
            )}
          </nav>

          <div className="header-right">
            {isLoggedIn ? (
              <div className="header-user-actions">
                <Link
                  className="header-cart-btn"
                  aria-label={cartItemCount > 0 ? `Giỏ hàng có ${cartItemCount} mặt hàng` : "Giỏ hàng"}
                  to="/cart"
                  data-cart-target
                >
                  <ShoppingBag size={20} strokeWidth={2} />
                  {cartItemCount > 0 && (
                    <span className="header-cart-badge">
                      {cartItemCount > 99 ? "99+" : cartItemCount}
                    </span>
                  )}
                </Link>

                <div className="header-profile-menu" ref={profileMenuRef}>
                  <button
                    className="header-avatar-btn"
                    type="button"
                    aria-label="Mở menu tài khoản"
                    aria-haspopup="menu"
                    aria-expanded={isProfileMenuOpen}
                    onClick={() => setIsProfileMenuOpen((value) => !value)}
                  >
                    <CircleUserRound color="white" size={24} strokeWidth={2} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isProfileMenuOpen && (
                      <motion.div
                        className="header-profile-dropdown"
                        role="menu"
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      >
                      <Link
                        className="header-profile-dropdown__item"
                        role="menuitem"
                        to="/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <UserRound size={18} strokeWidth={2} />
                        <span>Tài khoản</span>
                      </Link>
                      <Link
                        className="header-profile-dropdown__item"
                        role="menuitem"
                        to="/upgrade-account"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Star size={18} strokeWidth={2} />
                        <span>Nâng cấp </span>
                      </Link>
                      {canChangePassword && (
                        <Link
                          className="header-profile-dropdown__item"
                          role="menuitem"
                          to="/change-password"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <Lock size={18} strokeWidth={2} />
                          <span>Đổi mật khẩu</span>
                        </Link>
                      )}
                      <button
                        className="header-profile-dropdown__item"
                        role="menuitem"
                        type="button"
                        onClick={handleLogout}
                      >
                        <LogOut size={18} strokeWidth={2} />
                        <span>Đăng xuất</span>
                      </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="header-auth">
                <Link className="btn-signup" to="/login">Đăng nhập</Link>
                <Link className="btn-login" to="/register">Đăng ký</Link>
              </div>
            )}
          </div>

          <button
            className={`menu-toggle ${isMenuOpen ? "active" : ""}`}
            onClick={toggleMenu}
            aria-label="Mở menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
};

export default Header;
