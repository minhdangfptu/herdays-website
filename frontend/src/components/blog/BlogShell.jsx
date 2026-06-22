import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

import herdaysLogo from '../../assets/herdays-logo.png'
import { authApi } from '../../services/apiService.js'

const getNavClassName = ({ isActive }) => [
  'rounded-full px-4 py-2 text-sm font-semibold transition',
  isActive ? 'bg-pink-500 text-white' : 'text-slate-600 hover:bg-pink-50 hover:text-pink-600'
].join(' ')

function BlogShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const isAdminPage = location.pathname.startsWith('/admin')
  const isAdmin = localStorage.getItem('userRole') === 'admin'

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // Phiên phía server có thể đã hết hạn; vẫn phải xóa token cục bộ.
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userRole')
      navigate('/', { replace: true })
    }
  }

  return (
    <div className="min-h-svh bg-[#fff8fb] text-slate-700">
      <header className="sticky top-0 z-20 border-b border-pink-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/blog" aria-label="HERDAYS Blog">
            <img className="h-10 w-auto sm:h-12" src={herdaysLogo} alt="HERDAYS" />
          </Link>
          <nav className="flex items-center gap-2" aria-label="Điều hướng blog">
            <NavLink className={getNavClassName} to="/blog">Blog</NavLink>
            {isAdmin && <NavLink className={getNavClassName} to="/admin/posts">Quản trị</NavLink>}
            {isAdmin && isAdminPage && (
              <button
                className="rounded-full border border-pink-200 px-4 py-2 text-sm font-semibold text-pink-600 transition hover:bg-pink-50"
                type="button"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            )}
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  )
}

export default BlogShell
