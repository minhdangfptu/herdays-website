import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import "./Header.scss";
import logoTrang from "../assets/home/logo_trang.png";

const Header = ({ isLoggedIn = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const loggedOutMenuItems = [
    { label: "Trang chủ", to: "/home" },
    { label: "Tải ứng dụng", to: "/download-app" },
    { label: "Liên hệ", to: "/contact-us" },
    { label: "Về chúng tôi", to: "/about-us" },
  ];

  const loggedInMenuItems = [
    { label: "Trang chủ", to: "/home" },
    { label: "Bài viết", to: "#" },
    { label: "Cửa hàng", to: "#" },
    { label: "HerbotAI", to: "#" },
    { label: "Tải ứng dụng", to: "/download-app" },
  ];

  const menuItems = isLoggedIn ? loggedInMenuItems : loggedOutMenuItems;

  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo">
          <Link to="/home">
            <img src={logoTrang} alt="HERDAYS" className="logo-image" />
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className={`header-nav ${isMenuOpen ? "active" : ""}`}>
          <ul className="nav-list">
            {menuItems.map((item, index) => (
              <li key={index} className="nav-item">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right Side — Auth or Logged-in Actions */}
        <div className="header-right">
          {isLoggedIn ? (
            <div className="header-user-actions">
              {/* Cart Icon */}
              <button className="header-cart-btn" aria-label="Giỏ hàng">
                <ShoppingBag size={20} strokeWidth={2} />
              </button>

              {/* Avatar */}
              <button className="header-avatar-btn" aria-label="Tài khoản">
                <img
                  src="https://via.placeholder.com/36"
                  alt="Avatar"
                  className="header-avatar"
                />
              </button>
            </div>
          ) : (
            <div className="header-auth">
              <button onClick={() => navigate("/login")} className="btn-signup">Đăng nhập</button>
              <button onClick={() => navigate("/register")} className="btn-login">Đăng ký</button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={`menu-toggle ${isMenuOpen ? "active" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
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
