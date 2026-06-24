import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import herdaysLogo from "../../assets/herdays-logo.png";
import { authApi } from "../../services/apiService.js";

const getNavClassName = ({ isActive }) =>
  [
    "rounded-full px-4 py-2 text-sm font-semibold transition",
    isActive
      ? "bg-pink-500 text-white"
      : "text-slate-600 hover:bg-pink-50 hover:text-pink-600",
  ].join(" ");

function BlogShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminPage = location.pathname.startsWith("/admin");
  const isAdmin = localStorage.getItem("userRole") === "admin";

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Phiên phía server có thể đã hết hạn; vẫn phải xóa token cục bộ.
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userRole");
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="min-h-svh bg-[#fff8fb] text-slate-700">
      <Outlet />
    </div>
  );
}

export default BlogShell;
