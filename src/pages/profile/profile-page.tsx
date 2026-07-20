import { LogOut, Mail, Pencil, Phone, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button, Field, TextInput } from '@/components/auth/auth-ui'
import { useAuth } from '@/hooks/use-auth-context'
import type { UserRole } from '@/types/auth'
import { getProfile, updateProfile } from '@/services/auth/auth.service'
import { validators } from '@/utils/validators'

const ROLE_LABEL: Record<UserRole, string> = {
  CUSTOMER: 'Khách hàng',
  ADMIN: 'Chủ sân',
  SUPER_ADMIN: 'Super Admin',
  STAFF: 'Nhân viên',
}

function Toast({ msg }: { msg: string }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white text-sm shadow-lg animate-in fade-in slide-in-from-bottom-2">
      <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
        <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3 text-white">
          <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {msg}
    </div>
  )
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, isLoggedIn, clearAuth } = useAuth()

  useEffect(() => {
    if (!isLoggedIn) navigate('/auth/login?role=customer', { replace: true })
  }, [isLoggedIn, navigate])

  const [editing, setEditing] = useState(false)
  const [toast, setToast] = useState('')

  const [f, setF] = useState({
    name: '',
    phone: '',
    email: user?.email ?? '',
  })
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)

  const setField = (k: string, v: string) => { setF((x) => ({ ...x, [k]: v })); setErrs((e) => ({ ...e, [k]: '' })) }

  const initials = f.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  const roleLabel = user ? (ROLE_LABEL[user.role] ?? user.role) : ''

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3200)
  }

  useEffect(() => {
    if (!isLoggedIn) return

    let active = true
    setLoadingProfile(true)
    getProfile()
      .then((response) => {
        if (!active || !response.data) return
        setF({
          name: response.data.fullName ?? '',
          phone: response.data.phone ?? '',
          email: response.data.email,
        })
      })
      .catch((error) => {
        if (active) setErrs({ form: error instanceof Error ? error.message : 'Không thể tải thông tin cá nhân.' })
      })
      .finally(() => {
        if (active) setLoadingProfile(false)
      })

    return () => { active = false }
  }, [isLoggedIn])

  async function saveProfile(ev: React.FormEvent) {
    ev.preventDefault()
    const e: Record<string, string> = {}
    if (!f.name.trim()) e.name = 'Vui lòng nhập họ tên'
    else if (!validators.phone(f.phone)) e.phone = 'Số điện thoại không hợp lệ'
    if (!f.phone.trim()) e.phone = 'Vui lòng nhập SĐT'
    if (Object.keys(e).length) { setErrs(e); return }
    setSaving(true)
    try {
      const response = await updateProfile({ fullName: f.name.trim(), phone: f.phone })
      if (response.data) {
        setF({ name: response.data.fullName ?? '', phone: response.data.phone ?? '', email: response.data.email })
      }
      setEditing(false)
      showToast('Cập nhật thông tin thành công!')
    } catch (error) {
      setErrs({ form: error instanceof Error ? error.message : 'Không thể cập nhật thông tin.' })
    } finally {
      setSaving(false)
    }
  }

  function logout() {
    clearAuth()
    navigate('/auth/role-pick')
  }

  if (!isLoggedIn || !user) return null

  const infoRows = [
    { label: 'Họ và tên', val: f.name, icon: User },
    { label: 'Số điện thoại', val: f.phone || '—', icon: Phone },
    { label: 'Email', val: f.email, icon: Mail },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {toast && <Toast msg={toast} />}
      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-6">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between">
          <button type="button" onClick={() => navigate('/')} className="text-2xl font-bold tracking-tight text-green-700">
            FCourt
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1.5 sm:px-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">{initials}</div>
              <span className="hidden text-sm font-semibold text-slate-700 sm:inline">Tài khoản</span>
            </div>
            <Button variant="ghost" onClick={logout}>
              <LogOut size={15} /> <span className="hidden sm:inline">Đăng xuất</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 pb-20 space-y-4">
        {errs.form && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errs.form}</div>}
        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="h-24 rounded-t-2xl bg-[linear-gradient(140deg,#1fae5f_0%,#0e9d57_55%,#0b8a4d_100%)] relative overflow-hidden">
            <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 680 90" preserveAspectRatio="xMidYMid slice">
              <g transform="translate(340,45) rotate(-4) scale(0.92)">
                <rect x="-200" y="-38" width="400" height="76" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="1.5" />
                <line x1="-200" y1="0" x2="200" y2="0" stroke="rgba(255,255,255,.7)" strokeWidth="2.2" />
                <line x1="-200" y1="-13" x2="200" y2="-13" stroke="rgba(255,255,255,.4)" strokeWidth="1" />
                <line x1="-200" y1="13" x2="200" y2="13" stroke="rgba(255,255,255,.4)" strokeWidth="1" />
              </g>
            </svg>
          </div>
          <div className="relative bg-white px-7 pb-6">
            <div className="flex items-end justify-between -mt-7 mb-4">
              <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-green-600 text-xl font-extrabold text-white shadow-md">
                {initials}
              </div>
              {!editing && (
                <div className="relative z-10">
                  <Button variant="ghost" onClick={() => { setEditing(true); setErrs({}) }}>
                  <Pencil size={14} /> Chỉnh sửa
                  </Button>
                </div>
              )}
            </div>
            <div className="font-extrabold text-xl text-slate-900 mb-1">{f.name}</div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] text-slate-500">{f.email}</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-green-50 text-green-700">
                {roleLabel}
              </span>
              {user.role === 'ADMIN' && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700">
                  Đang chờ duyệt
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Info / Edit */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7">
          <div className="flex items-center gap-2 font-bold text-[15px] text-slate-900 mb-5">
            <User size={17} className="text-green-600" /> Thông tin cá nhân
          </div>
          {loadingProfile ? (
            <div className="py-8 text-center text-sm text-slate-500">Đang tải thông tin cá nhân...</div>
          ) : editing ? (
            <form onSubmit={saveProfile} noValidate>
              <Field label="Họ và tên" error={errs.name}>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <User size={15} />
                </span>
                <TextInput hasIcon value={f.name} onChange={(e) => setField('name', e.target.value)} error={errs.name} placeholder="Nguyễn Văn A" />
              </Field>
              <div className="grid grid-cols-2 gap-x-3.5">
                <Field label="Số điện thoại" error={errs.phone}>
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Phone size={15} />
                  </span>
                  <TextInput hasIcon value={f.phone} onChange={(e) => setField('phone', e.target.value)} error={errs.phone} placeholder="0901 234 567" />
                </Field>
                <Field label="Email">
                  <TextInput value={f.email} disabled className="opacity-60 cursor-not-allowed" />
                </Field>
              </div>
              <div className="flex gap-2.5 justify-end">
                <Button type="button" variant="ghost" onClick={() => { setEditing(false); setErrs({}) }}>Huỷ</Button>
                <Button type="submit" loading={saving}>Lưu thay đổi</Button>
              </div>
            </form>
          ) : (
            <div>
              {infoRows.map(({ label, val, icon: Icon }) => (
                <div key={label} className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
                  <Icon size={16} className="text-slate-300 flex-shrink-0" />
                  <span className="text-[13px] text-slate-400 w-36 flex-shrink-0">{label}</span>
                  <span className="text-[14px] font-medium text-slate-800 flex-1">{val}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  )
}
