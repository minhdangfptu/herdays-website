import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'

import herdaysLogo from '../../assets/herdays-logo.png'
import { authApi, clearAuthSession, hasAuthSession } from '../../services/apiService.js'

const getNavClassName = ({ isActive }) => [
  'rounded-full px-4 py-2 text-sm font-semibold transition',
  isActive ? 'bg-pink-500 text-white' : 'text-slate-600 hover:bg-pink-50 hover:text-pink-600'
].join(' ')

const getAuthState = () => ({
  isLoggedIn: hasAuthSession(),
  isAdmin: localStorage.getItem('userRole') === 'admin'
})

function BlogShell() {
  const navigate = useNavigate()
  const [authState, setAuthState] = useState(getAuthState)

  useEffect(() => {
    const syncAuthState = () => setAuthState(getAuthState())

    window.addEventListener('storage', syncAuthState)
    window.addEventListener('auth-state-change', syncAuthState)
    return () => {
      window.removeEventListener('storage', syncAuthState)
      window.removeEventListener('auth-state-change', syncAuthState)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // The server-side session may already be expired; local credentials still need clearing.
    } finally {
      clearAuthSession()
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
            {authState.isAdmin && <NavLink className={getNavClassName} to="/admin/posts">Quản trị</NavLink>}
            {authState.isLoggedIn ? (
              <button
                className="rounded-full border border-pink-200 px-4 py-2 text-sm font-semibold text-pink-600 transition hover:bg-pink-50"
                type="button"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            ) : (
              <NavLink className={getNavClassName} to="/">Đăng nhập</NavLink>
            )}
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  )
}

export default BlogShell
