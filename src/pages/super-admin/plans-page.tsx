import { Check, Pencil, Plus, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { useCreatePlan, useDeletePlan, usePlans, useUpdatePlan } from '@/hooks/use-subscription-plans'
import type { PlanData, PlanRequest } from '@/types/admin'

const COLORS = ['#15803D', '#0EA5E9', '#D97706', '#65A30D', '#7C3AED', '#DB2777']

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

function fmtVND(n: number | null) {
  if (!n) return '—'
  return n.toLocaleString('vi-VN') + 'đ'
}

const DEFAULT_FORM: PlanRequest = {
  name: '', tagline: '', monthlyPrice: undefined, yearlyPrice: undefined,
  maxBranches: 1, maxCourts: 5, features: [], color: '#15803D', popular: false,
}

function PlanFormModal({
  open,
  editing,
  onClose,
  onSave,
}: {
  open: boolean
  editing: PlanData | null
  onClose: () => void
  onSave: (data: PlanRequest) => void
}) {
  const [f, setF] = useState<PlanRequest & { featuresText: string }>({ ...DEFAULT_FORM, featuresText: '' })
  const creating = useCreatePlan()
  const updating = useUpdatePlan()
  const loading = creating.isPending || updating.isPending

  useEffect(() => {
    if (open) {
      if (editing) {
        setF({ name: editing.name, tagline: editing.tagline ?? '', monthlyPrice: editing.monthlyPrice ?? undefined, yearlyPrice: editing.yearlyPrice ?? undefined, maxBranches: editing.maxBranches, maxCourts: editing.maxCourts, features: editing.features, color: editing.color ?? '#15803D', popular: editing.popular, featuresText: editing.features.join('\n') })
      } else {
        setF({ ...DEFAULT_FORM, featuresText: '' })
      }
    }
  }, [open, editing])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }))

  function handleSave() {
    const features = f.featuresText.split('\n').map((s) => s.trim()).filter(Boolean)
    onSave({ name: f.name, tagline: f.tagline, monthlyPrice: f.monthlyPrice, yearlyPrice: f.yearlyPrice, maxBranches: f.maxBranches, maxCourts: f.maxCourts, features, color: f.color, popular: f.popular })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-[500px] mx-4 bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h3 className="text-[17px] font-bold text-slate-900">{editing ? 'Sửa gói đăng ký' : 'Thêm gói đăng ký'}</h3>
            <p className="text-[12.5px] text-slate-400 mt-0.5">Gói áp dụng cho chủ sân khi đăng ký</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition mt-0.5">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-slate-500 mb-1.5">Tên gói <span className="text-red-500">*</span></label>
              <input className="w-full h-9 rounded-xl border border-slate-200 px-3 text-[13.5px] focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20" placeholder="VD: Tiêu chuẩn" value={f.name} onChange={(e) => set('name', e.target.value)} autoFocus />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-slate-500 mb-1.5">Mô tả ngắn</label>
              <input className="w-full h-9 rounded-xl border border-slate-200 px-3 text-[13.5px] focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20" placeholder="VD: Phổ biến cho chuỗi vừa" value={f.tagline ?? ''} onChange={(e) => set('tagline', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-slate-500 mb-1.5">Giá / tháng (đ)</label>
              <input type="number" className="w-full h-9 rounded-xl border border-slate-200 px-3 text-[13.5px] focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20" placeholder="699000" value={f.monthlyPrice ?? ''} onChange={(e) => set('monthlyPrice', e.target.value ? Number(e.target.value) : undefined)} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-slate-500 mb-1.5">Giá / năm (đ)</label>
              <input type="number" className="w-full h-9 rounded-xl border border-slate-200 px-3 text-[13.5px] focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20" placeholder="6990000" value={f.yearlyPrice ?? ''} onChange={(e) => set('yearlyPrice', e.target.value ? Number(e.target.value) : undefined)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-slate-500 mb-1.5">Số cơ sở tối đa <span className="text-red-500">*</span></label>
              <input type="number" min={1} className="w-full h-9 rounded-xl border border-slate-200 px-3 text-[13.5px] focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20" value={f.maxBranches} onChange={(e) => set('maxBranches', Math.max(1, Number(e.target.value)))} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-slate-500 mb-1.5">Số sân tối đa <span className="text-red-500">*</span></label>
              <input type="number" min={1} className="w-full h-9 rounded-xl border border-slate-200 px-3 text-[13.5px] focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20" value={f.maxCourts} onChange={(e) => set('maxCourts', Math.max(1, Number(e.target.value)))} />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-slate-500 mb-1.5">Tính năng (mỗi dòng một mục)</label>
            <textarea
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[13.5px] focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 resize-none"
              rows={4}
              placeholder={'Quản lý đặt sân nâng cao\nBáo cáo chi tiết\nHỗ trợ ưu tiên'}
              value={f.featuresText}
              onChange={(e) => set('featuresText', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-slate-500 mb-2">Màu nhận diện</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => set('color', c)} className="w-8 h-8 rounded-xl transition" style={{ background: c, boxShadow: f.color === c ? `0 0 0 2px #fff, 0 0 0 4px ${c}` : 'none' }} />
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={f.popular} onChange={(e) => set('popular', e.target.checked)} className="w-4 h-4 accent-green-600" />
            <span className="text-[13.5px] font-medium text-slate-700">Đánh dấu là gói phổ biến</span>
          </label>
        </div>

        <div className="flex gap-2.5 px-6 py-4 border-t border-slate-100 justify-end">
          <button className="px-4 py-2 rounded-xl border border-slate-200 text-[13.5px] font-semibold text-slate-700 hover:bg-slate-50 transition" onClick={onClose}>Huỷ</button>
          <button className="px-4 py-2 rounded-xl bg-green-600 text-white text-[13.5px] font-semibold hover:bg-green-700 transition disabled:opacity-60" disabled={!f.name.trim() || loading} onClick={handleSave}>
            {loading ? 'Đang lưu…' : editing ? 'Lưu thay đổi' : 'Thêm gói'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function PlansPage() {
  const { data, isLoading } = usePlans()
  const createMut = useCreatePlan()
  const updateMut = useUpdatePlan()
  const deleteMut = useDeletePlan()

  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<PlanData | null>(null)
  const [delTarget, setDelTarget] = useState<PlanData | null>(null)
  const [toast, setToast] = useState('')
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const list = data?.data?.content ?? []

  function showToast(msg: string) {
    clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(''), 3000)
  }

  function handleSave(req: PlanRequest) {
    if (editing) {
      updateMut.mutate({ id: editing.id, data: req }, { onSuccess: () => { setFormOpen(false); showToast('Đã cập nhật gói') } })
    } else {
      createMut.mutate(req, { onSuccess: () => { setFormOpen(false); showToast('Đã thêm gói mới') } })
    }
  }

  function handleDelete() {
    if (!delTarget) return
    deleteMut.mutate(delTarget.id, { onSuccess: () => { setDelTarget(null); showToast('Đã xóa gói') } })
  }

  return (
    <div className="p-6 space-y-5 max-w-6xl">
      {toast && <Toast msg={toast} />}

      <div className="flex items-end justify-between">
        <div>
          <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Cấu hình hệ thống</p>
          <h1 className="text-xl font-bold text-slate-900">Gói đăng ký</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">Cấu hình các gói dịch vụ cho chủ sân</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-slate-200 bg-white overflow-hidden text-[12.5px] font-semibold">
            <button onClick={() => setCycle('monthly')} className={`px-3.5 py-1.5 transition ${cycle === 'monthly' ? 'bg-green-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
              Theo tháng
            </button>
            <button onClick={() => setCycle('yearly')} className={`px-3.5 py-1.5 transition ${cycle === 'yearly' ? 'bg-green-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
              Theo năm
            </button>
          </div>
          <button onClick={() => { setEditing(null); setFormOpen(true) }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 text-white text-[13.5px] font-semibold hover:bg-green-700 transition">
            <Plus size={16} strokeWidth={2.5} /> Thêm gói
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-slate-400 text-sm">Đang tải…</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            {list.map((plan) => {
              const color = plan.color ?? '#15803D'
              const price = cycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice
              return (
                <div key={plan.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden relative" style={{ borderColor: plan.popular ? color : '#e2e8f0' }}>
                  {plan.popular && (
                    <div className="absolute top-0 right-0 text-[10px] font-bold text-white px-3 py-1 rounded-bl-xl" style={{ background: color }}>
                      PHỔ BIẾN
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-3 h-3 rounded-sm" style={{ background: color }} />
                      <h3 className="text-[17px] font-bold text-slate-900">{plan.name}</h3>
                    </div>
                    <p className="text-[13px] text-slate-400 mb-4">{plan.tagline ?? ''}</p>

                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-[26px] font-bold text-slate-900 tracking-tight">{fmtVND(price)}</span>
                      <span className="text-[13px] text-slate-400">/{cycle === 'monthly' ? 'tháng' : 'năm'}</span>
                    </div>
                    {cycle === 'yearly' && plan.monthlyPrice && plan.yearlyPrice && (
                      <div className="text-[12px] font-semibold mb-4" style={{ color }}>
                        Tiết kiệm {fmtVND(plan.monthlyPrice * 12 - plan.yearlyPrice)}/năm
                      </div>
                    )}
                    {cycle === 'monthly' && <div className="mb-4" />}

                    <div className="flex gap-3 p-3 bg-slate-50 rounded-xl mb-4">
                      <div className="flex-1 text-center">
                        <div className="text-[17px] font-bold text-slate-900">{plan.maxBranches >= 99 ? '∞' : plan.maxBranches}</div>
                        <div className="text-[11.5px] text-slate-400">Cơ sở</div>
                      </div>
                      <div className="w-px bg-slate-200" />
                      <div className="flex-1 text-center">
                        <div className="text-[17px] font-bold text-slate-900">{plan.maxCourts >= 99 ? '∞' : plan.maxCourts}</div>
                        <div className="text-[11.5px] text-slate-400">Sân</div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {plan.features.map((ft, i) => (
                        <div key={i} className="flex gap-2 text-[13px] text-slate-600">
                          <Check size={14} strokeWidth={2.5} className="flex-shrink-0 mt-0.5" style={{ color }} />
                          {ft}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3.5 border-t border-slate-100">
                      <span className="text-[13px] text-slate-400">—</span>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditing(plan); setFormOpen(true) }} className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center transition">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDelTarget(plan)} className="w-8 h-8 rounded-lg text-red-400 hover:bg-red-50 flex items-center justify-center transition">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {list.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                <Check size={20} />
              </div>
              <div>
                <div className="text-[13.5px] font-semibold text-slate-800">Tổng {list.length} gói đăng ký đang cấu hình</div>
                <div className="text-[12px] text-slate-400">Thay đổi giá chỉ áp dụng cho đăng ký mới, không ảnh hưởng hợp đồng đang chạy.</div>
              </div>
            </div>
          )}
        </>
      )}

      <PlanFormModal open={formOpen} editing={editing} onClose={() => setFormOpen(false)} onSave={handleSave} />
      <ConfirmDialog
        open={!!delTarget}
        title="Xóa gói đăng ký?"
        body={delTarget ? `"${delTarget.name}" sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.` : ''}
        confirmLabel="Xóa gói"
        danger
        loading={deleteMut.isPending}
        onConfirm={handleDelete}
        onClose={() => setDelTarget(null)}
      />
    </div>
  )
}
