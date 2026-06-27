import { useState } from "react";
import "./Header.scss";
import logoTrang from "../assets/home/logo_trang.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    { label: "Trang chủ", href: "#" },
    { label: "Tài ứng dụng", href: "#" },
    { label: "Liên hệ", href: "/contact-us" },
    { label: "Về chúng tôi", href: "#" },
  ];

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo">
          <a href="/">
            <img src={logoTrang} alt="HERDAYS" className="logo-image" />
          </a>
        </div>

        {/* Navigation Menu */}
        <nav className={`header-nav ${isMenuOpen ? "active" : ""}`}>
          <ul className="nav-list">
            {menuItems.map((item, index) => (
              <li key={index} className="nav-item">
                <a href={item.href} className="nav-link">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Auth Buttons */}
        <div className="header-auth">
          <button className="btn-signup">Đăng nhập</button>
          <button className="btn-login">Đăng ký</button>
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
