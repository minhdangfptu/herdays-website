import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { CircleUserRound, LogOut, ShoppingBag, UserRound } from "lucide-react";
import "./Header.scss";
import logoTrang from "../assets/home/logo_trang.png";
import { authApi, clearAuthSession, hasAuthSession } from "../services/apiService.js";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(hasAuthSession());
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleAuthChanged = () => setIsLoggedIn(hasAuthSession());
    window.addEventListener("auth-state-change", handleAuthChanged);
    window.addEventListener("storage", handleAuthChanged);
    return () => {
      window.removeEventListener("auth-state-change", handleAuthChanged);
      window.removeEventListener("storage", handleAuthChanged);
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

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);

    try {
      await authApi.logout();
    } catch {
      // Local session must still be cleared when the server token is already expired.
    } finally {
      clearAuthSession();
      navigate("/login", { replace: true });
    }
  };

  const loggedOutMenuItems = [
    { label: "Trang chá»§", to: "/home" },
    { label: "Táº£i á»©ng dá»¥ng", to: "/download-app" },
    { label: "LiÃªn há»‡", to: "/contact-us" },
    { label: "Vá» chÃºng tÃ´i", to: "/about-us" },
  ];

  const loggedInMenuItems = [
    { label: "Trang chá»§", to: "/home" },
    { label: "BÃ i viáº¿t", to: "/blog" },
    { label: "Cá»­a hÃ ng", to: "/upgrade-account" },
    { label: "HerbotAI", to: "/chat-with-herbot" },
    { label: "Táº£i á»©ng dá»¥ng", to: "/download-app" },
  ];

  const menuItems = isLoggedIn ? loggedInMenuItems : loggedOutMenuItems;

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <Link to="/home">
            <img src={logoTrang} alt="HERDAYS" className="logo-image" />
          </Link>
        </div>

        <nav className={`header-nav ${isMenuOpen ? "active" : ""}`}>
          <ul className="nav-list">
            {menuItems.map((item) => (
              <li key={item.label} className="nav-item">
                <NavLink
                  to={item.to}
                  end={item.to === "/home"}
                  className={({ isActive }) =>
                    item.to !== "#" && isActive ? "nav-link active" : "nav-link"
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-right">
          {isLoggedIn ? (
            <div className="header-user-actions">
              <Link className="header-cart-btn" aria-label="Giá» hÃ ng" to="/upgrade-account">
                <ShoppingBag size={20} strokeWidth={2} />
              </Link>

              <div className="header-profile-menu" ref={profileMenuRef}>
                <button
                  className="header-avatar-btn"
                  type="button"
                  aria-label="Má»Ÿ menu tÃ i khoáº£n"
                  aria-haspopup="menu"
                  aria-expanded={isProfileMenuOpen}
                  onClick={() => setIsProfileMenuOpen((value) => !value)}
                >
                  <CircleUserRound size={24} strokeWidth={2} />
                </button>

                {isProfileMenuOpen && (
                  <div className="header-profile-dropdown" role="menu">
                    <Link
                      className="header-profile-dropdown__item"
                      role="menuitem"
                      to="/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <UserRound size={18} strokeWidth={2} />
                      <span>Profile</span>
                    </Link>
                    <button
                      className="header-profile-dropdown__item"
                      role="menuitem"
                      type="button"
                      onClick={handleLogout}
                    >
                      <LogOut size={18} strokeWidth={2} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="header-auth">
              <Link className="btn-signup" to="/login">ÄÄƒng nháº­p</Link>
              <Link className="btn-login" to="/register">ÄÄƒng kÃ½</Link>
            </div>
          )}
        </div>

        <button
          className={`menu-toggle ${isMenuOpen ? "active" : ""}`}
          onClick={toggleMenu}
          aria-label="Má»Ÿ menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
