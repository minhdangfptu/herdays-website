import React from "react";
import { Camera, Globe, MessageCircle, Video } from "lucide-react";
import {
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaFacebookMessenger,
} from "react-icons/fa6";
import "./Footer.scss";
import logoMau from "../assets/home/logo_mau.png";
import chPlay from "../assets/ch_play.png";
import appStore from "../assets/app_store.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Tính năng",
      links: [
        { name: "Mua sắm", href: "#" },
        { name: "Blog - Bài viết", href: "#" },
        { name: "Herbot", href: "#" },
      ],
    },
    {
      title: "Hỗ trợ",
      links: [
        { name: "Thu thập dữ liệu", href: "#" },
        { name: "Chính sách bảo mật", href: "#" },
        { name: "Điều khoản sử dụng", href: "#" },
      ],
    },
    {
      title: "Về Herdays",
      links: [
        { name: "Liên hệ", href: "#" },
        { name: "Về chúng tôi", href: "#" },
        { name: "Hỗ trợ", href: "#" },
      ],
    },
  ];

  const socialLinks = [
    { icon: FaFacebook, href: "#", label: "Facebook" },
    { icon: FaInstagram, href: "#", label: "Instagram" },
    { icon: FaTiktok, href: "#", label: "TikTok" },
    { icon: FaFacebookMessenger, href: "#", label: "Messenger" },
  ];

  return (
    <footer className="footer">
      <div className="footer-white-card" />
      <div className="footer-container">
        {/* Left Section - Logo and Description */}
        <div className="footer-left">
          <div className="footer-logo">
            <img src={logoMau} alt="HERDAYS Logo" />
          </div>
          <p className="footer-description">
            Mỗi hành trình đẹu xứng đáng được lắng nghe, và HerDays sẽ luôn ở
            đây để đồng hành cùng bạn!
          </p>
          <div className="social-links">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <a
                  key={index}
                  href={social.href}
                  className="social-icon"
                  aria-label={social.label}
                >
                  <Icon size={20} />
                </a>
              );
            })}
          </div>
        </div>

        {/* Right Section - Links and App Buttons */}
        <div className="footer-right-section">
          {/* Links */}
          <div className="footer-links">
            {footerSections.map((section, index) => (
              <div key={index} className="footer-section">
                <h4 className="section-title">{section.title}</h4>
                <ul>
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href={link.href}>
                        {link.name}
                        <span className="link-underline" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* App Store Buttons */}
          <div className="app-buttons">
            <a href="#" className="app-button google-play">
              <img src={chPlay} alt="Google Play" />
            </a>
            <a href="#" className="app-button app-store">
              <img src={appStore} alt="App Store" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom - Copyright */}
      <div className="footer-bottom">
        <p>&copy; {currentYear} Herdays. Bảo lưu mọi quyền</p>
      </div>
    </footer>
  );
};

export default Footer;
