import { useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  RefreshCcw,
  Search,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

import { adminApi } from '../../services/apiService.js'

const PAGE_SIZE = 8
const ADMIN_FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"

const responseTabs = [
  { label: 'Tất cả', value: '' },
  { label: 'Đã phản hồi', value: true },
  { label: 'Chưa phản hồi', value: false }
]

const topicLabels = {
  general: 'Tổng quát',
  account: 'Tài khoản',
  technical: 'Kỹ thuật',
  partnership: 'Hợp tác',
  feedback: 'Góp ý',
  other: 'Khác'
}

const topicToneClasses = {
  general: 'bg-sky-50 text-sky-600',
  account: 'bg-purple-50 text-purple-600',
  technical: 'bg-amber-50 text-amber-600',
  partnership: 'bg-emerald-50 text-emerald-600',
  feedback: 'bg-pink-50 text-pink-600',
  other: 'bg-slate-50 text-slate-500'
}

const getContactId = (contact) => contact._id || contact.id

const formatDate = (date) => {
  if (!date) return 'Chưa có'

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

function TopicBadge({ topic }) {
  const label = topicLabels[topic] || topic || 'Khác'
  const toneClassName = topicToneClasses[topic] || topicToneClasses.other

  return (
    <span className={`inline-flex min-w-20 items-center justify-center rounded-md px-3 py-1 text-xs font-bold ${toneClassName}`}>
      {label}
    </span>
  )
}

function ResponseBadge({ isRessponsed }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${isRessponsed ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${isRessponsed ? 'bg-emerald-500' : 'bg-red-500'}`} />
      {isRessponsed ? 'Đã phản hồi' : 'Chưa phản hồi'}
    </span>
  )
}

function ContactDetailModal({ contact, isUpdating, onClose, onToggleResponse }) {
  if (!contact) return null

  const contactId = getContactId(contact)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6">
      <section className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="m-0 text-2xl font-semibold text-slate-800">Chi tiết liên hệ</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">{formatDate(contact.createdAt)}</p>
          </div>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
            type="button"
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-bold uppercase text-slate-400">Họ tên</p>
            <p className="m-0 font-semibold text-slate-700">{contact.senderName}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-bold uppercase text-slate-400">Số điện thoại</p>
            <p className="m-0 font-semibold text-slate-700">{contact.phone}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-bold uppercase text-slate-400">Email</p>
            <p className="m-0 break-all font-semibold text-slate-700">{contact.email}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-bold uppercase text-slate-400">Tỉnh/Thành phố</p>
            <p className="m-0 font-semibold text-slate-700">{contact.province}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-bold uppercase text-slate-400">Chủ đề</p>
            <TopicBadge topic={contact.topic} />
          </div>
          <div>
            <p className="mb-1 text-xs font-bold uppercase text-slate-400">Trạng thái</p>
            <ResponseBadge isRessponsed={contact.isRessponsed} />
          </div>
          <div className="sm:col-span-2">
            <p className="mb-1 text-xs font-bold uppercase text-slate-400">Địa chỉ</p>
            <p className="m-0 font-semibold text-slate-700">{contact.address || 'Chưa cung cấp'}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="mb-2 text-xs font-bold uppercase text-slate-400">Nội dung</p>
            <p className="m-0 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm font-medium leading-6 text-slate-700">
              {contact.message}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            type="button"
            onClick={onClose}
          >
            Đóng
          </button>
          <button
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold text-white transition ${contact.isRessponsed ? 'bg-slate-500 hover:bg-slate-600' : 'bg-pink-500 hover:bg-pink-600'} disabled:cursor-not-allowed disabled:opacity-60`}
            type="button"
            disabled={isUpdating}
            onClick={() => onToggleResponse(contactId, !contact.isRessponsed)}
          >
            {contact.isRessponsed ? <RefreshCcw size={16} /> : <CheckCircle2 size={16} />}
            {contact.isRessponsed ? 'Đánh dấu chưa phản hồi' : 'Đánh dấu đã phản hồi'}
          </button>
        </div>
      </section>
    </div>
  )
}

function AdminContactsPage() {
  const [contacts, setContacts] = useState([])
  const [pagination, setPagination] = useState({ currentPage: 1, limit: PAGE_SIZE, totalItems: 0, totalPages: 1 })
  const [page, setPage] = useState(1)
  const [responseStatus, setResponseStatus] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [selectedContact, setSelectedContact] = useState(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1)
      setDebouncedSearch(search.trim())
    }, 350)

    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let isActive = true

    const fetchContacts = async () => {
      setIsLoading(true)
      try {
        const result = await adminApi.getContacts({
          page,
          limit: PAGE_SIZE,
          search: debouncedSearch,
          isRessponsed: responseStatus
        })

        if (!isActive) return
        setContacts(result.contacts || [])
        setPagination(result.pagination || { currentPage: page, limit: PAGE_SIZE, totalItems: result.contacts?.length || 0, totalPages: 1 })
      } catch (error) {
        if (isActive) toast.error(error.message || 'Không thể tải danh sách liên hệ.')
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    fetchContacts()

    return () => {
      isActive = false
    }
  }, [page, responseStatus, debouncedSearch])

  const visiblePages = useMemo(() => {
    const totalPages = Math.max(1, pagination.totalPages || 1)
    const start = Math.max(1, Math.min(page - 2, totalPages - 4))
    return Array.from({ length: Math.min(5, totalPages) }, (_, index) => start + index)
      .filter((value) => value <= totalPages)
  }, [page, pagination.totalPages])

  const handleStatusTabChange = (nextStatus) => {
    setResponseStatus(nextStatus)
    setPage(1)
  }

  const handleToggleResponse = async (contactId, nextStatus) => {
    setUpdatingId(contactId)
    try {
      const result = await adminApi.updateContactResponseStatus(contactId, nextStatus)
      const updatedContact = result.contact
      const shouldRemainVisible = typeof responseStatus !== 'boolean' || updatedContact.isRessponsed === responseStatus

      setContacts((currentContacts) => currentContacts.map((contact) => (
        getContactId(contact) === contactId ? updatedContact : contact
      )).filter((contact) => shouldRemainVisible || getContactId(contact) !== contactId))
      setSelectedContact((currentContact) => (
        currentContact && getContactId(currentContact) === contactId ? updatedContact : currentContact
      ))
      if (!shouldRemainVisible) {
        setPagination((currentPagination) => ({
          ...currentPagination,
          totalItems: Math.max(0, (currentPagination.totalItems || 0) - 1)
        }))
      }
      toast.success(result.message || 'Đã cập nhật trạng thái liên hệ.')
    } catch (error) {
      toast.error(error.message || 'Không thể cập nhật trạng thái liên hệ.')
    } finally {
      setUpdatingId(null)
    }
  }

  const firstItem = pagination.totalItems === 0 ? 0 : ((pagination.currentPage || page) - 1) * PAGE_SIZE + 1
  const lastItem = Math.min((pagination.currentPage || page) * PAGE_SIZE, pagination.totalItems || 0)

  return (
    <main
      className="min-h-screen bg-slate-50 px-5 py-6 sm:px-8"
      style={{ fontFamily: ADMIN_FONT_FAMILY }}
    >
      <div className="mb-7 flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-pink-500">
            <Mail size={23} />
          </div>
          <div>
            <h1
              className="m-0 text-[32px] font-semibold leading-tight text-[#333333]"
              style={{ fontFamily: ADMIN_FONT_FAMILY }}
            >
              Quản lý liên hệ
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">Quản lý tất cả liên hệ trong hệ thống</p>
          </div>
        </div>

        <label className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-pink-300 focus:ring-4 focus:ring-pink-50"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm kiếm liên hệ..."
          />
        </label>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap gap-2 border-b border-slate-100 px-4 py-4">
          {responseTabs.map((tab) => (
            <button
              className={`rounded-lg px-5 py-2 text-sm font-bold transition ${responseStatus === tab.value ? 'bg-pink-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-pink-50 hover:text-pink-500'}`}
              type="button"
              key={String(tab.value)}
              onClick={() => handleStatusTabChange(tab.value)}
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
                <th className="px-6 py-4">Số điện thoại</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Chủ đề</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Ngày gửi</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td className="px-6 py-10 text-center font-semibold text-slate-400" colSpan={7}>Đang tải liên hệ...</td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td className="px-6 py-10 text-center font-semibold text-slate-400" colSpan={7}>Không tìm thấy liên hệ phù hợp.</td>
                </tr>
              ) : contacts.map((contact) => {
                const contactId = getContactId(contact)
                const isUpdating = updatingId === contactId

                return (
                  <tr className="transition hover:bg-pink-50/30" key={contactId}>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-700">{contact.senderName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-500">{contact.phone}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-500">{contact.email}</span>
                    </td>
                    <td className="px-6 py-4"><TopicBadge topic={contact.topic} /></td>
                    <td className="px-6 py-4"><ResponseBadge isRessponsed={contact.isRessponsed} /></td>
                    <td className="px-6 py-4">
                      <span className="whitespace-nowrap font-medium text-slate-500">{formatDate(contact.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-3">
                        <button
                          className="inline-flex items-center gap-1.5 font-bold text-pink-500 transition hover:text-pink-600"
                          type="button"
                          onClick={() => setSelectedContact(contact)}
                        >
                          <Eye size={15} />
                          Xem chi tiết
                        </button>
                        <button
                          className={`inline-flex items-center gap-1.5 font-bold transition ${contact.isRessponsed ? 'text-slate-500 hover:text-slate-700' : 'text-emerald-600 hover:text-emerald-700'} disabled:cursor-not-allowed disabled:opacity-50`}
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleToggleResponse(contactId, !contact.isRessponsed)}
                        >
                          {contact.isRessponsed ? <RefreshCcw size={15} /> : <CheckCircle2 size={15} />}
                          {contact.isRessponsed ? 'Hoàn tác' : 'Đã phản hồi'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-slate-500">
            Hiển thị trong tổng số liên hệ {firstItem}-{lastItem} / {pagination.totalItems || 0}
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

      <ContactDetailModal
        contact={selectedContact}
        isUpdating={Boolean(updatingId)}
        onClose={() => setSelectedContact(null)}
        onToggleResponse={handleToggleResponse}
      />
    </main>
  )
}

export default AdminContactsPage
