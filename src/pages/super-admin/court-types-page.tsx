import { Bike, Check, CircleDot, Dumbbell, Feather, Layers, Pencil, Plus, Star, Trophy, X, Zap } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import {
  useCourtTypes,
  useCreateCourtType,
  useDeleteCourtType,
  useUpdateCourtType,
} from '@/hooks/use-court-types'
import type { CourtTypeData, CourtTypeRequest } from '@/types/admin'

const ICONS = [
  { name: 'feather', Icon: Feather },
  { name: 'zap', Icon: Zap },
  { name: 'star', Icon: Star },
  { name: 'trophy', Icon: Trophy },
  { name: 'layers', Icon: Layers },
  { name: 'dumbbell', Icon: Dumbbell },
  { name: 'bike', Icon: Bike },
  { name: 'circle-dot', Icon: CircleDot },
]
const COLORS = ['#15803D', '#0EA5E9', '#D97706', '#65A30D', '#7C3AED', '#DB2777']

function getIcon(name: string | null) {
  return ICONS.find((i) => i.name === name)?.Icon ?? Feather
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

const DEFAULT_FORM: CourtTypeRequest = { name: '', nameEn: '', description: '', icon: 'feather', color: '#15803D', active: true }

function TypeFormModal({
  open,
  editing,
  onClose,
  onSave,
}: {
  open: boolean
  editing: CourtTypeData | null
  onClose: () => void
  onSave: (data: CourtTypeRequest) => void
}) {
  const [f, setF] = useState<CourtTypeRequest>(DEFAULT_FORM)
  const creating = useCreateCourtType()
  const updating = useUpdateCourtType()
  const loading = creating.isPending || updating.isPending

  useEffect(() => {
    if (open) {
      setF(editing
        ? { name: editing.name, nameEn: editing.nameEn ?? '', description: editing.description ?? '', icon: editing.icon ?? 'feather', color: editing.color ?? '#15803D', active: editing.active }
        : DEFAULT_FORM)
    }
  }, [open, editing])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null
  const set = (k: keyof CourtTypeRequest, v: string | boolean) => setF((p) => ({ ...p, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-[480px] mx-4 bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h3 className="text-[17px] font-bold text-slate-900">{editing ? 'Sửa loại sân' : 'Thêm loại sân'}</h3>
            <p className="text-[12.5px] text-slate-400 mt-0.5">Danh mục dùng chung cho mọi chủ sân</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition mt-0.5">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-slate-500 mb-1.5">Tên loại sân (Tiếng Việt) <span className="text-red-500">*</span></label>
              <input
                className="w-full h-9 rounded-xl border border-slate-200 px-3 text-[13.5px] focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                placeholder="VD: Cầu lông"
                value={f.name}
                onChange={(e) => set('name', e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-slate-500 mb-1.5">Tên Tiếng Anh</label>
              <input
                className="w-full h-9 rounded-xl border border-slate-200 px-3 text-[13.5px] focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                placeholder="VD: Badminton"
                value={f.nameEn}
                onChange={(e) => set('nameEn', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-slate-500 mb-1.5">Mô tả</label>
            <textarea
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[13.5px] focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 resize-none"
              rows={2}
              placeholder="Mô tả ngắn về loại sân…"
              value={f.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-slate-500 mb-2">Biểu tượng</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(({ name, Icon }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => set('icon', name)}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center border-[1.5px] transition ${
                    f.icon === name ? 'border-current' : 'border-slate-200 text-slate-400 hover:border-slate-300'
                  }`}
                  style={f.icon === name ? { color: f.color, borderColor: f.color, background: f.color + '14' } : {}}
                >
                  <Icon size={20} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-slate-500 mb-2">Màu nhận diện</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set('color', c)}
                  className="w-8 h-8 rounded-xl transition"
                  style={{ background: c, boxShadow: f.color === c ? `0 0 0 2px #fff, 0 0 0 4px ${c}` : 'none' }}
                />
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={f.active}
              onChange={(e) => set('active', e.target.checked)}
              className="w-4 h-4 accent-green-600"
            />
            <span className="text-[13.5px] font-medium text-slate-700">Kích hoạt — cho phép chủ sân chọn loại này</span>
          </label>
        </div>

        <div className="flex gap-2.5 px-6 py-4 border-t border-slate-100 justify-end">
          <button className="px-4 py-2 rounded-xl border border-slate-200 text-[13.5px] font-semibold text-slate-700 hover:bg-slate-50 transition" onClick={onClose}>
            Huỷ
          </button>
          <button
            className="px-4 py-2 rounded-xl bg-green-600 text-white text-[13.5px] font-semibold hover:bg-green-700 transition disabled:opacity-60"
            disabled={!f.name.trim() || loading}
            onClick={() => onSave(f)}
          >
            {loading ? 'Đang lưu…' : editing ? 'Lưu thay đổi' : 'Thêm loại sân'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function CourtTypesPage() {
  const { data, isLoading } = useCourtTypes()
  const createMut = useCreateCourtType()
  const updateMut = useUpdateCourtType()
  const deleteMut = useDeleteCourtType()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<CourtTypeData | null>(null)
  const [delTarget, setDelTarget] = useState<CourtTypeData | null>(null)
  const [toast, setToast] = useState('')
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const list = data?.data?.content ?? []

  function showToast(msg: string) {
    clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(''), 3000)
  }

  function openCreate() { setEditing(null); setFormOpen(true) }
  function openEdit(item: CourtTypeData) { setEditing(item); setFormOpen(true) }

  function handleSave(req: CourtTypeRequest) {
    if (editing) {
      updateMut.mutate({ id: editing.id, data: req }, {
        onSuccess: () => { setFormOpen(false); showToast('Đã cập nhật loại sân') },
      })
    } else {
      createMut.mutate(req, {
        onSuccess: () => { setFormOpen(false); showToast('Đã thêm loại sân mới') },
      })
    }
  }

  function handleToggleActive(item: CourtTypeData) {
    updateMut.mutate(
      { id: item.id, data: { name: item.name, nameEn: item.nameEn ?? undefined, description: item.description ?? undefined, icon: item.icon ?? undefined, color: item.color ?? undefined, active: !item.active } },
      { onSuccess: () => showToast(item.active ? 'Đã ẩn loại sân' : 'Đã kích hoạt loại sân') },
    )
  }

  function handleDelete() {
    if (!delTarget) return
    deleteMut.mutate(delTarget.id, {
      onSuccess: () => { setDelTarget(null); showToast('Đã xóa loại sân') },
    })
  }

  return (
    <div className="p-6 space-y-5 max-w-6xl">
      {toast && <Toast msg={toast} />}

      <div className="flex items-end justify-between">
        <div>
          <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Cấu hình hệ thống</p>
          <h1 className="text-xl font-bold text-slate-900">Danh mục loại sân</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">Quản lý các loại hình thể thao dùng chung toàn hệ thống</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 text-white text-[13.5px] font-semibold hover:bg-green-700 transition"
        >
          <Plus size={16} strokeWidth={2.5} /> Thêm loại sân
        </button>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-slate-400 text-sm">Đang tải…</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {list.map((item) => {
            const Icon = getIcon(item.icon)
            const color = item.color ?? '#15803D'
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 relative"
                style={{ opacity: item.active ? 1 : 0.65 }}
              >
                <div className="flex items-start justify-between mb-3.5">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: color + '18', color }}>
                    <Icon size={24} />
                  </div>
                  <button
                    onClick={() => handleToggleActive(item)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${item.active ? 'bg-green-500' : 'bg-slate-200'}`}
                    title={item.active ? 'Ẩn loại sân' : 'Kích hoạt'}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${item.active ? 'translate-x-4' : 'translate-x-1'}`} />
                  </button>
                </div>

                <h3 className="text-[15px] font-bold text-slate-900 mb-0.5">{item.name}</h3>
                {item.nameEn && <div className="text-[12px] text-slate-400 font-medium mb-2">{item.nameEn}</div>}
                <p className="text-[13px] text-slate-500 leading-relaxed min-h-[40px] mb-4">{item.description ?? '—'}</p>

                <div className="flex items-center justify-between pt-3.5 border-t border-slate-100">
                  <span className={`text-[11.5px] font-semibold px-2.5 py-1 rounded-lg ${item.active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {item.active ? 'Đang dùng' : 'Đã ẩn'}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(item)} className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center transition">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDelTarget(item)} className="w-8 h-8 rounded-lg text-red-400 hover:bg-red-50 flex items-center justify-center transition">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Add tile */}
          <button
            onClick={openCreate}
            className="bg-slate-50 rounded-2xl border-[1.5px] border-dashed border-slate-200 min-h-[200px] flex flex-col items-center justify-center gap-3 hover:border-green-400 hover:bg-green-50/40 transition group"
          >
            <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 group-hover:bg-green-50 group-hover:border-green-200 flex items-center justify-center transition">
              <Plus size={22} className="text-slate-400 group-hover:text-green-600 transition" />
            </div>
            <span className="text-[13.5px] font-semibold text-slate-400 group-hover:text-green-700 transition">Thêm loại sân mới</span>
          </button>
        </div>
      )}

      <TypeFormModal open={formOpen} editing={editing} onClose={() => setFormOpen(false)} onSave={handleSave} />
      <ConfirmDialog
        open={!!delTarget}
        title="Xóa loại sân?"
        body={delTarget ? `Bạn có chắc muốn xóa "${delTarget.name}"? Hành động này không thể hoàn tác.` : ''}
        confirmLabel="Xóa"
        danger
        loading={deleteMut.isPending}
        onConfirm={handleDelete}
        onClose={() => setDelTarget(null)}
      />
    </div>
  )
}
