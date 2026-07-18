import { useEffect } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  body?: string
  confirmLabel?: string
  danger?: boolean
  loading?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Xác nhận',
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-sm mx-4 bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-[17px] font-bold text-slate-900 mb-2">{title}</h3>
        {body && <p className="text-[13.5px] text-slate-500 leading-relaxed mb-6">{body}</p>}
        {!body && <div className="mb-4" />}
        <div className="flex gap-2.5 justify-end">
          <button
            className="px-4 py-2 rounded-xl text-[13.5px] font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            onClick={onClose}
            disabled={loading}
          >
            Huỷ
          </button>
          <button
            className={`px-4 py-2 rounded-xl text-[13.5px] font-semibold text-white transition disabled:opacity-60 ${
              danger ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'
            }`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Đang xử lý…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
