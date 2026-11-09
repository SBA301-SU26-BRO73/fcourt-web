import { Check, FileText, ImageOff, Mail, Phone, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { toastApiError } from '@/common/utils/api-error'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { useApproveUser, useRejectUser, useUserDetail, useUsers } from '@/hooks/use-users'
import type { UserAdminItem, UserDocumentItem } from '@/types/admin'

const DOC_TYPE_LABEL: Record<UserDocumentItem['docType'], string> = {
  LEGAL: 'Giấy tờ pháp lý',
  COURT_IMAGE: 'Ảnh sân',
}

function isImageUrl(url: string) {
  return /\.(png|jpe?g|gif|webp|avif)$/i.test(url)
}

function DocumentGallery({ documents }: { documents: UserDocumentItem[] }) {
  if (documents.length === 0) {
    return (
      <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-100 text-[13px] text-slate-500 flex items-center gap-2">
        <ImageOff size={15} className="text-slate-400" /> Chưa có hồ sơ giấy tờ/ảnh sân nào được nộp.
      </div>
    )
  }

  const groups = documents.reduce<Record<string, UserDocumentItem[]>>((acc, doc) => {
    (acc[doc.docType] ??= []).push(doc)
    return acc
  }, {})

  return (
    <div className="mt-5 space-y-4">
      {Object.entries(groups).map(([docType, docs]) => (
        <div key={docType}>
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            {DOC_TYPE_LABEL[docType as UserDocumentItem['docType']] ?? docType}
          </h4>
          <div className="grid grid-cols-3 gap-2.5">
            {docs.map((doc) =>
              isImageUrl(doc.url) ? (
                <a
                  key={doc.id}
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block aspect-square rounded-xl overflow-hidden border border-slate-200 hover:ring-2 hover:ring-green-500/40 transition"
                >
                  <img src={doc.url} alt={DOC_TYPE_LABEL[doc.docType] ?? doc.docType} className="w-full h-full object-cover" />
                </a>
              ) : (
                <a
                  key={doc.id}
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="aspect-square rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-1.5 text-slate-500 hover:bg-slate-100 transition"
                >
                  <FileText size={20} />
                  <span className="text-[11px] font-medium">Xem tệp</span>
                </a>
              ),
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function Toast({ msg }: { msg: string }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white text-sm shadow-lg">
      <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
        <Check size={11} strokeWidth={3} />
      </span>
      {msg}
    </div>
  )
}

function StatusBadge({ status }: { status: UserAdminItem['status'] }) {
  const map = {
    PENDING_APPROVAL: { label: 'Chờ duyệt', cls: 'bg-amber-50 text-amber-600' },
    ACTIVE: { label: 'Đang hoạt động', cls: 'bg-green-50 text-green-700' },
    INACTIVE: { label: 'Ngừng hoạt động', cls: 'bg-red-50 text-red-600' },
    REJECTED: { label: 'Từ chối', cls: 'bg-red-50 text-red-600' },
    LOCKED: { label: 'Đã khóa', cls: 'bg-slate-100 text-slate-500' },
  }
  const { label, cls } = map[status] ?? { label: status, cls: 'bg-slate-100 text-slate-500' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11.5px] font-semibold ${cls}`}>
      {label}
    </span>
  )
}

function Avatar({ name, email }: { name: string | null; email: string }) {
  const initials = (name ?? email).split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
      {initials}
    </div>
  )
}

const REASON_MAX = 500

function RejectDialog({ open, ...props }: { open: boolean; name: string; loading: boolean; onConfirm: (reason: string) => void; onClose: () => void }) {
  return open ? <RejectForm {...props} /> : null
}

function RejectForm({
  name,
  loading,
  onConfirm,
  onClose,
}: {
  name: string
  loading: boolean
  onConfirm: (reason: string) => void
  onClose: () => void
}) {
  const [reason, setReason] = useState('')
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const trimmed = reason.trim()
  const invalid = trimmed.length === 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-sm mx-4 bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-[17px] font-bold text-slate-900 mb-2">Từ chối đăng ký?</h3>
        <p className="text-[13.5px] text-slate-500 leading-relaxed mb-4">
          Đăng ký của "{name}" sẽ bị từ chối. Lý do sẽ được gửi cho chủ sân.
        </p>
        <label className="block">
          <span className="text-[12.5px] font-semibold text-slate-600">
            Lý do từ chối <span className="text-red-500">*</span>
          </span>
          <textarea
            value={reason}
            maxLength={REASON_MAX}
            onChange={(e) => setReason(e.target.value)}
            onBlur={() => setTouched(true)}
            rows={3}
            placeholder="Ví dụ: Giấy tờ pháp lý không rõ ràng"
            className={`mt-1.5 w-full resize-none rounded-xl border px-3 py-2 text-[13.5px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
              touched && invalid
                ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20'
                : 'border-slate-200 focus:border-green-500 focus:ring-green-500/20'
            }`}
          />
        </label>
        <div className="mt-1 mb-5 flex justify-between text-[12px]">
          <span className="text-red-500">{touched && invalid ? 'Vui lòng nhập lý do từ chối' : ''}</span>
          <span className="text-slate-400">{trimmed.length}/{REASON_MAX}</span>
        </div>
        <div className="flex gap-2.5 justify-end">
          <button
            className="px-4 py-2 rounded-xl text-[13.5px] font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            onClick={onClose}
            disabled={loading}
          >
            Huỷ
          </button>
          <button
            className="px-4 py-2 rounded-xl text-[13.5px] font-semibold text-white bg-red-500 hover:bg-red-600 transition disabled:opacity-60"
            onClick={() => {
              if (invalid) { setTouched(true); return }
              onConfirm(trimmed)
            }}
            disabled={loading || (touched && invalid)}
          >
            {loading ? 'Đang xử lý…' : 'Từ chối'}
          </button>
        </div>
      </div>
    </div>
  )
}

function RegDrawer({
  item,
  onClose,
  onApprove,
  onReject,
}: {
  item: UserAdminItem | null
  onClose: () => void
  onApprove: (item: UserAdminItem) => void
  onReject: (item: UserAdminItem, reason: string) => void
}) {
  const [confirmApprove, setConfirmApprove] = useState(false)
  const [confirmReject, setConfirmReject] = useState(false)
  const { isPending: isApproving } = useApproveUser()
  const { isPending: isRejecting } = useRejectUser()
  const { data: detail, isLoading: isLoadingDetail } = useUserDetail(item?.id ?? null)

  useEffect(() => {
    if (!item) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [item, onClose])

  if (!item) return null

  const infoRows = [
    { icon: Mail, label: 'Email', value: item.email },
    { icon: Phone, label: 'Số điện thoại', value: item.phone ?? '—' },
  ]

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-[520px] z-50 bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-100">
          <Avatar name={item.fullName} email={item.email} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[16px] font-bold text-slate-900">{item.fullName ?? item.email}</span>
              <StatusBadge status={item.status} />
            </div>
            <div className="text-[12.5px] text-slate-400 mt-0.5">
              Đăng ký {new Date(item.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">Thông tin liên hệ</h4>
          {infoRows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
              <Icon size={16} className="text-slate-300 flex-shrink-0" />
              <span className="text-[12.5px] text-slate-400 w-32 flex-shrink-0">{label}</span>
              <span className="text-[13.5px] font-medium text-slate-800">{value}</span>
            </div>
          ))}

          {isLoadingDetail ? (
            <div className="mt-5 py-8 text-center text-sm text-slate-400">Đang tải hồ sơ…</div>
          ) : (
            <DocumentGallery documents={detail?.documents ?? []} />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-2.5">
          <button
            className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-600 text-[13.5px] font-semibold hover:bg-red-50 transition flex items-center justify-center gap-2"
            onClick={() => setConfirmReject(true)}
          >
            <X size={16} /> Từ chối
          </button>
          <button
            className="flex-[2] py-2.5 rounded-xl bg-green-600 text-white text-[13.5px] font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
            onClick={() => setConfirmApprove(true)}
          >
            <Check size={16} strokeWidth={2.5} /> Duyệt đăng ký
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmApprove}
        title={`Duyệt đăng ký?`}
        body={`Chủ sân "${item.fullName ?? item.email}" sẽ được kích hoạt và có thể đăng nhập vào hệ thống.`}
        confirmLabel="Duyệt"
        loading={isApproving}
        onConfirm={() => { onApprove(item); setConfirmApprove(false) }}
        onClose={() => setConfirmApprove(false)}
      />
      <RejectDialog
        open={confirmReject}
        name={item.fullName ?? item.email}
        loading={isRejecting}
        onConfirm={(reason) => { onReject(item, reason); setConfirmReject(false) }}
        onClose={() => setConfirmReject(false)}
      />
    </>
  )
}

export function PendingPage() {
  const { data, isLoading } = useUsers()
  const approveUser = useApproveUser()
  const rejectUser = useRejectUser()
  const [q, setQ] = useState('')
  const [sel, setSel] = useState<UserAdminItem | null>(null)
  const [toast, setToast] = useState('')
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const list = data?.content ?? []
  const filtered = list.filter(
    (u) =>
      (u.fullName ?? '').toLowerCase().includes(q.toLowerCase()) ||
      u.email.toLowerCase().includes(q.toLowerCase()),
  )

  function showToast(msg: string) {
    clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(''), 3000)
  }

  function handleApprove(item: UserAdminItem) {
    approveUser.mutate(item.id, {
      onSuccess: () => { setSel(null); showToast(`Đã duyệt "${item.fullName ?? item.email}"`) },
      onError: (e) => toastApiError(e, 'Không thể duyệt chủ sân'),
    })
  }

  function handleReject(item: UserAdminItem, reason: string) {
    rejectUser.mutate({ id: item.id, reason }, {
      onSuccess: () => { setSel(null); showToast(`Đã từ chối "${item.fullName ?? item.email}"`) },
      onError: (e) => toastApiError(e, 'Không thể từ chối chủ sân'),
    })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {toast && <Toast msg={toast} />}

      {/* Header */}
      <div>
        <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Quản lý Admin</p>
        <h1 className="text-xl font-bold text-slate-900">Đăng ký chờ duyệt</h1>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            className="h-9 w-72 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-[13.5px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
            placeholder="Tìm theo tên, email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="ml-auto text-[13px] text-slate-400">{filtered.length} kết quả</div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-sm">Đang tải…</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-500 flex items-center justify-center mx-auto mb-3">
              <Check size={24} />
            </div>
            <div className="text-[14px] font-semibold text-slate-600">Không còn đăng ký nào chờ duyệt</div>
            <div className="text-[13px] text-slate-400 mt-1">Mọi hồ sơ đã được xử lý.</div>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['Chủ sân', 'Liên hệ', 'Ngày đăng ký', 'Thao tác'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[12px] font-semibold text-slate-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => setSel(item)}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={item.fullName} email={item.email} />
                      <div>
                        <div className="text-[14px] font-semibold text-slate-900">{item.fullName ?? '—'}</div>
                        <div className="text-[12.5px] text-slate-400">{item.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[13.5px] text-slate-600">{item.phone ?? '—'}</td>
                  <td className="px-5 py-4 text-[13.5px] text-slate-500">
                    {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-[12.5px] font-medium text-slate-600 hover:bg-slate-50 transition"
                        onClick={() => setSel(item)}
                      >
                        Chi tiết
                      </button>
                      <button
                        className="w-8 h-8 rounded-lg bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition"
                        title="Duyệt nhanh"
                        onClick={() => handleApprove(item)}
                      >
                        <Check size={15} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <RegDrawer item={sel} onClose={() => setSel(null)} onApprove={handleApprove} onReject={handleReject} />
    </div>
  )
}
