import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import { adminApi } from '../../services/apiService.js'

const PAGE_SIZE = 8
const ADMIN_FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"

const roleTabs = [
  { label: 'Tất cả', value: '' },
  { label: 'Người dùng', value: 'user_free' },
  { label: 'Admin', value: 'admin' }
]

const targetStatusLabels = {
  tryingToConceive: 'Sắp bầu',
  pregnant: 'Đang bầu',
  ivf: 'IVF',
  normal: 'Sức khỏe',
  periodTracking: 'Chu kỳ',
  relatives: 'Người thân'
}

const targetToneClasses = {
  tryingToConceive: 'bg-purple-50 text-purple-600',
  pregnant: 'bg-yellow-50 text-yellow-600',
  ivf: 'bg-blue-50 text-blue-600',
  normal: 'bg-slate-50 text-slate-600',
  periodTracking: 'bg-pink-50 text-pink-600',
  relatives: 'bg-emerald-50 text-emerald-600'
}

const avatarColors = [
  'from-pink-300 to-rose-400',
  'from-sky-300 to-blue-400',
  'from-emerald-300 to-teal-400',
  'from-violet-300 to-purple-400',
  'from-amber-300 to-orange-400'
]

const getInitials = (user) => {
  const source = user.fullName || user.email || 'Herdays'
  const words = source.replace(/@.*/, '').split(/\s+/).filter(Boolean)
  if (words.length >= 2) return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
  return source.slice(0, 2).toUpperCase()
}

function UserAvatar({ user, index = 0 }) {
  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarColors[index % avatarColors.length]} text-sm font-bold text-white shadow-sm`}>
      {getInitials(user)}
    </div>
  )
}

function TargetBadge({ targetStatus }) {
  const label = targetStatusLabels[targetStatus] || 'Chưa có'
  const toneClassName = targetToneClasses[targetStatus] || 'bg-slate-50 text-slate-500'

  return (
    <span className={`inline-flex min-w-16 items-center justify-center rounded-md px-3 py-1 text-xs font-bold ${toneClassName}`}>
      {label}
    </span>
  )
}

function StatusBadge({ user }) {
  if (user.isDisabled) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-500">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        Vô hiệu hóa
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${user.isVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${user.isVerified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      {user.isVerified ? 'Đang hoạt động' : 'Chưa xác thực'}
    </span>
  )
}

function AdminUsersPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 })
  const [page, setPage] = useState(1)
  const [role, setRole] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1)
      setDebouncedSearch(search.trim())
    }, 350)

    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let isActive = true

    const fetchUsers = async () => {
      setIsLoading(true)
      try {
        const result = await adminApi.getUsers({
          page,
          limit: PAGE_SIZE,
          role,
          search: debouncedSearch,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        })

        if (!isActive) return
        setUsers(result.users)
        setPagination(result.pagination || { page, limit: PAGE_SIZE, total: result.users.length, totalPages: 1 })
      } catch (error) {
        if (isActive) toast.error(error.message || 'Không thể tải danh sách người dùng.')
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    fetchUsers()

    return () => {
      isActive = false
    }
  }, [page, role, debouncedSearch])

  const visiblePages = useMemo(() => {
    const totalPages = Math.max(1, pagination.totalPages || 1)
    const start = Math.max(1, Math.min(page - 2, totalPages - 4))
    return Array.from({ length: Math.min(5, totalPages) }, (_, index) => start + index)
      .filter((value) => value <= totalPages)
  }, [page, pagination.totalPages])

  const handleRoleChange = (nextRole) => {
    setRole(nextRole)
    setPage(1)
  }

  const firstItem = pagination.total === 0 ? 0 : ((pagination.page || page) - 1) * PAGE_SIZE + 1
  const lastItem = Math.min((pagination.page || page) * PAGE_SIZE, pagination.total || 0)

  return (
    <main
      className="min-h-screen bg-slate-50 px-5 py-6 sm:px-8"
      style={{ fontFamily: ADMIN_FONT_FAMILY }}
    >
      <div className="mb-7 flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1
              className="m-0 text-[32px] font-semibold leading-tight text-[#333333]"
              style={{ fontFamily: ADMIN_FONT_FAMILY }}
            >
              Quản lý người dùng
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">Quản lý tất cả người dùng trong hệ thống</p>
          </div>
        </div>

        <label className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-pink-300 focus:ring-4 focus:ring-pink-50"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm kiếm người dùng..."
          />
        </label>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap gap-2 border-b border-slate-100 px-4 py-4">
          {roleTabs.map((tab) => (
            <button
              className={`rounded-lg px-5 py-2 text-sm font-bold transition ${role === tab.value ? 'bg-pink-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-pink-50 hover:text-pink-500'}`}
              type="button"
              key={tab.value || 'all'}
              onClick={() => handleRoleChange(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-4">Họ tên</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Mục tiêu</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td className="px-6 py-10 text-center font-semibold text-slate-400" colSpan={5}>Đang tải người dùng...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td className="px-6 py-10 text-center font-semibold text-slate-400" colSpan={5}>Không tìm thấy người dùng phù hợp.</td>
                </tr>
              ) : users.map((user, index) => (
                <tr className="transition hover:bg-pink-50/30" key={user._id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={user} index={index} />
                      <span className="font-bold text-slate-700">{user.fullName || 'Chưa cập nhật'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-500">{user.email}</span>
                  </td>
                  <td className="px-6 py-4"><TargetBadge targetStatus={user.targetStatus} /></td>
                  <td className="px-6 py-4"><StatusBadge user={user} /></td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="font-bold text-pink-500 transition hover:text-pink-600"
                      type="button"
                      onClick={() => navigate(`/admin/users/${user._id}`)}
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-slate-500">
            Hiển thị trong tổng số người dùng {firstItem}-{lastItem} / {pagination.total || 0}
          </p>
          <div className="flex items-center gap-2">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              type="button"
              disabled={isLoading || page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              aria-label="Trang trước"
            >
              <ChevronLeft size={16} />
            </button>
            {visiblePages.map((pageNumber) => (
              <button
                className={`h-9 min-w-9 rounded-lg px-3 text-sm font-bold transition ${page === pageNumber ? 'bg-pink-500 text-white' : 'border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                type="button"
                key={pageNumber}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              type="button"
              disabled={isLoading || page >= (pagination.totalPages || 1)}
              onClick={() => setPage((value) => Math.min(pagination.totalPages || 1, value + 1))}
              aria-label="Trang sau"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

    </main>
  )
}

export default AdminUsersPage
