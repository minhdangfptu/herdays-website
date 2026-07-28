import { useEffect, useState } from 'react'
import { AlertTriangle, ArrowLeft, Ban, Mail, Phone, Shield, UserCheck, UserRound, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'

import { adminApi } from '../../services/apiService.js'
import { Skeleton } from '../../components/Skeleton.jsx'

const ADMIN_FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"

const targetStatusLabels = {
  tryingToConceive: 'Sắp bầu',
  pregnant: 'Đang bầu',
  ivf: 'IVF',
  normal: 'Sức khỏe',
  periodTracking: 'Chu kỳ',
  relatives: 'Người thân',
  partner: 'Người thân'
}

const roleLabels = {
  user_free: 'User',
  user_premium: 'Premium',
  admin: 'Admin',
  others: 'Khác'
}

const avatarColors = [
  'from-pink-300 to-rose-400',
  'from-sky-300 to-blue-400',
  'from-emerald-300 to-teal-400',
  'from-violet-300 to-purple-400'
]

const getInitials = (user) => {
  const source = user?.fullName || user?.email || 'HerDays'
  const words = source.replace(/@.*/, '').split(/\s+/).filter(Boolean)
  if (words.length >= 2) return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
  return source.slice(0, 2).toUpperCase()
}

const formatDate = (value) => {
  if (!value) return 'Chưa cập nhật'
  return new Date(value).toLocaleDateString('vi-VN')
}

const formatPhone = (phone) => {
  if (!phone) return 'Chưa cập nhật'
  if (/^\+84\d{9}$/.test(phone)) return `0${phone.slice(3)}`
  return phone
}

function UserAvatar({ user }) {
  const colorIndex = (user?._id || '').length % avatarColors.length

  return (
    <div className={`mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br ${avatarColors[colorIndex]} text-3xl font-bold text-white shadow-sm`}>
      {getInitials(user)}
    </div>
  )
}

function StatusBadge({ user }) {
  if (user?.isDisabled) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-500">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        Vô hiệu hóa
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${user?.isVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${user?.isVerified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      {user?.isVerified ? 'Đang hoạt động' : 'Chưa xác thực'}
    </span>
  )
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-700">{value || 'Chưa cập nhật'}</p>
    </div>
  )
}

function DisableUserConfirmModal({ user, isSubmitting, onCancel, onConfirm }) {
  if (!user) return null

  const displayName = user.fullName || user.email || 'người dùng này'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6" style={{ fontFamily: ADMIN_FONT_FAMILY }}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
              <AlertTriangle size={22} />
            </span>
            <div>
              <h2 className="text-lg font-normal leading-6 text-slate-900">Xác nhận vô hiệu hóa</h2>
              <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                Tài khoản sau khi bị vô hiệu hóa sẽ không thể tiếp tục truy cập hệ thống.
              </p>
            </div>
          </div>
          <button
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            aria-label="Đóng modal xác nhận"
          >
            <X size={18} />
          </button>
        </div>

        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-sm font-normal text-slate-700">Người dùng</p>
          <p className="mt-1 text-base font-normal leading-6 text-slate-900">{displayName}</p>
          {user.email && <p className="mt-1 text-sm font-medium text-slate-500">{user.email}</p>}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-normal leading-5 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-500 px-4 text-sm font-normal leading-5 text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            style={{ fontFamily: ADMIN_FONT_FAMILY }}
          >
            <Ban size={16} />
            {isSubmitting ? 'Đang vô hiệu hóa...' : 'Xác nhận vô hiệu hóa'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AdminUserDetailPage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDisabling, setIsDisabling] = useState(false)
  const [isEnabling, setIsEnabling] = useState(false)
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false)

  useEffect(() => {
    let isActive = true

    const fetchUser = async () => {
      setIsLoading(true)
      try {
        const result = await adminApi.getUser(userId)
        if (isActive) setUser(result.user)
      } catch (error) {
        if (isActive) toast.error(error.message || 'Không thể tải chi tiết người dùng.')
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    fetchUser()

    return () => {
      isActive = false
    }
  }, [userId])

  const openDisableModal = () => {
    if (!user || user.isDisabled) return
    setIsDisableModalOpen(true)
  }

  const closeDisableModal = () => {
    if (isDisabling) return
    setIsDisableModalOpen(false)
  }

  const handleDisableUser = async () => {
    if (!user || user.isDisabled) return

    setIsDisabling(true)
    const loadingToast = toast.loading('Đang vô hiệu hóa tài khoản...')
    try {
      const result = await adminApi.disableUser(user._id)
      setUser(result.user)
      setIsDisableModalOpen(false)
      toast.success(result.message || 'Vô hiệu hóa tài khoản thành công.', { id: loadingToast })
    } catch (error) {
      toast.error(error.message || 'Không thể vô hiệu hóa tài khoản.', { id: loadingToast })
    } finally {
      setIsDisabling(false)
    }
  }

  const handleEnableUser = async () => {
    if (!user?.isDisabled || isEnabling) return

    setIsEnabling(true)
    const loadingToast = toast.loading('Đang gỡ vô hiệu hóa tài khoản...')
    try {
      const result = await adminApi.enableUser(user._id)
      setUser(result.user)
      toast.success(result.message || 'Gỡ vô hiệu hóa tài khoản thành công.', { id: loadingToast })
    } catch (error) {
      toast.error(error.message || 'Không thể gỡ vô hiệu hóa tài khoản.', { id: loadingToast })
    } finally {
      setIsEnabling(false)
    }
  }

  return (
    <main className="min-h-screen bg-white px-5 py-6 sm:px-8" style={{ fontFamily: ADMIN_FONT_FAMILY }}>
      <div className="mb-10 flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <button
            className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
            type="button"
            onClick={() => navigate('/admin/users')}
          >
            <ArrowLeft size={16} />
            Quay lại
          </button>
          <h1 className="m-0 text-xl font-bold text-slate-800">Chi tiết người dùng</h1>
        </div>

        {user?.isDisabled ? (
          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isEnabling}
            onClick={handleEnableUser}
            type="button"
          >
            <UserCheck size={16} />
            {isEnabling ? 'Đang xử lý...' : 'Gỡ vô hiệu hóa'}
          </button>
        ) : (
          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-pink-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            onClick={openDisableModal}
            disabled={!user || isDisabling}
          >
            <Ban size={16} />
            Vô hiệu hóa tài khoản
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-5 rounded-xl border border-slate-100 bg-slate-50 p-8" role="status" aria-label="Đang tải chi tiết người dùng">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : !user ? (
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-8 text-center font-semibold text-slate-500">Không tìm thấy người dùng.</div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <UserAvatar user={user} />
            <div className="mt-6 text-center">
              <h2 className="text-xl font-extrabold text-slate-800">{user.fullName || 'Chưa cập nhật tên'}</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">{user.email}</p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <StatusBadge user={user} />
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                  <UserRound size={13} />
                  {roleLabels[user.role] || user.role}
                </span>
              </div>
            </div>

            <div className="mt-7 grid gap-4 border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-slate-500">Số điện thoại</span>
                <span className="text-sm font-bold text-slate-700">{formatPhone(user.phone)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-slate-500">Ngày tham gia</span>
                <span className="text-sm font-bold text-slate-700">{formatDate(user.createdAt)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white">
                <Shield size={12} />
              </span>
              <h2 className="text-base font-extrabold text-slate-800">Thông tin chi tiết</h2>
            </div>

            <div className="grid gap-x-16 gap-y-6 sm:grid-cols-2">
              <DetailItem label="Họ và tên" value={user.fullName} />
              <DetailItem label="Email" value={user.email} />
              <DetailItem label="Số điện thoại" value={formatPhone(user.phone)} />
              <DetailItem label="Ngày sinh" value={formatDate(user.dateOfBirth)} />
              <DetailItem label="Hạng tài khoản" value={roleLabels[user.role] || user.role} />
              <DetailItem label="Mục tiêu" value={targetStatusLabels[user.targetStatus] || 'Chưa cập nhật'} />
              <DetailItem label="Vai trò" value={roleLabels[user.role] || user.role} />
              <DetailItem label="Địa chỉ" value={user.address || 'Chưa cập nhật'} />
              <DetailItem label="Trạng thái" value={user.isDisabled ? 'Vô hiệu hóa' : user.isVerified ? 'Đang hoạt động' : 'Chưa xác thực'} />
              <DetailItem label="Cập nhật lần cuối" value={formatDate(user.updatedAt)} />
            </div>

            <div className="mt-8 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <Mail className="text-pink-500" size={18} />
                <span className="text-sm font-semibold text-slate-600">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-pink-500" size={18} />
                <span className="text-sm font-semibold text-slate-600">{formatPhone(user.phone)}</span>
              </div>
            </div>
          </section>
        </div>
      )}

      {isDisableModalOpen && (
        <DisableUserConfirmModal
          user={user}
          isSubmitting={isDisabling}
          onCancel={closeDisableModal}
          onConfirm={handleDisableUser}
        />
      )}
    </main>
  )
}

export default AdminUserDetailPage
