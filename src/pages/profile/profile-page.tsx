import { Calendar, Key, LogOut, Mail, Pencil, Phone, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button, Field, Logo, PasswordInput, PwMeter, TextInput } from '@/components/auth/auth-ui'
import { useAuth } from '@/hooks/use-auth-context'
import type { UserRole } from '@/types/auth'

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
    if (!isLoggedIn) navigate('/auth/role-pick', { replace: true })
  }, [isLoggedIn, navigate])

  const [editing, setEditing] = useState(false)
  const [changingPw, setChangingPw] = useState(false)
  const [toast, setToast] = useState('')

  const [f, setF] = useState({
    name: 'Người dùng',
    phone: '',
    email: user?.email ?? '',
    dob: '',
  })
  const [pw, setPw] = useState({ cur: '', next: '', confirm: '' })
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  const setField = (k: string, v: string) => { setF((x) => ({ ...x, [k]: v })); setErrs((e) => ({ ...e, [k]: '' })) }
  const setPwField = (k: string, v: string) => { setPw((x) => ({ ...x, [k]: v })); setErrs((e) => ({ ...e, [k]: '' })) }

  const initials = f.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  const roleLabel = user ? (ROLE_LABEL[user.role] ?? user.role) : ''

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3200)
  }

  async function saveProfile(ev: React.FormEvent) {
    ev.preventDefault()
    const e: Record<string, string> = {}
    if (!f.name.trim()) e.name = 'Vui lòng nhập họ tên'
    if (!f.phone.trim()) e.phone = 'Vui lòng nhập SĐT'
    if (Object.keys(e).length) { setErrs(e); return }
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    setEditing(false)
    showToast('Cập nhật thông tin thành công!')
  }

  async function savePw(ev: React.FormEvent) {
    ev.preventDefault()
    const e: Record<string, string> = {}
    if (!pw.cur) e.cur = 'Nhập mật khẩu hiện tại'
    if (!pw.next || pw.next.length < 6) e.next = 'Tối thiểu 6 ký tự'
    if (pw.next !== pw.confirm) e.confirm = 'Mật khẩu không khớp'
    if (Object.keys(e).length) { setErrs(e); return }
    setSavingPw(true)
    await new Promise((r) => setTimeout(r, 800))
    setSavingPw(false)
    setChangingPw(false)
    setPw({ cur: '', next: '', confirm: '' })
    showToast('Đổi mật khẩu thành công!')
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
    { label: 'Ngày sinh', val: f.dob || '—', icon: Calendar },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {toast && <Toast msg={toast} />}
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 h-15 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
            <div className="w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <span className="text-[13px] font-semibold text-slate-700">{f.name}</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-green-50 text-green-700">
              {roleLabel}
            </span>
          </div>
          <Button variant="ghost" onClick={logout}>
            <LogOut size={15} /> Đăng xuất
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 pb-20 space-y-4">
        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="h-24 bg-[linear-gradient(140deg,#1fae5f_0%,#0e9d57_55%,#0b8a4d_100%)] relative">
            <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 680 90" preserveAspectRatio="xMidYMid slice">
              <g transform="translate(340,45) rotate(-4) scale(0.92)">
                <rect x="-200" y="-38" width="400" height="76" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="1.5" />
                <line x1="-200" y1="0" x2="200" y2="0" stroke="rgba(255,255,255,.7)" strokeWidth="2.2" />
                <line x1="-200" y1="-13" x2="200" y2="-13" stroke="rgba(255,255,255,.4)" strokeWidth="1" />
                <line x1="-200" y1="13" x2="200" y2="13" stroke="rgba(255,255,255,.4)" strokeWidth="1" />
              </g>
            </svg>
          </div>
          <div className="px-7 pb-6">
            <div className="flex items-end justify-between -mt-7 mb-4">
              <div className="w-14 h-14 rounded-full bg-green-600 text-white flex items-center justify-center text-xl font-extrabold border-[3px] border-white shadow-sm">
                {initials}
              </div>
              {!editing && (
                <Button variant="ghost" onClick={() => { setEditing(true); setErrs({}) }}>
                  <Pencil size={14} /> Chỉnh sửa
                </Button>
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
          {editing ? (
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
              <Field label="Ngày sinh" opt="Không bắt buộc">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Calendar size={15} />
                </span>
                <TextInput hasIcon type="date" value={f.dob} onChange={(e) => setField('dob', e.target.value)} />
              </Field>
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

        {/* Change password */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 font-bold text-[15px] text-slate-900">
              <Key size={17} className="text-green-600" /> Bảo mật tài khoản
            </div>
            {!changingPw && (
              <Button variant="subtle" onClick={() => { setChangingPw(true); setErrs({}) }}>
                Đổi mật khẩu
              </Button>
            )}
          </div>
          {changingPw && (
            <form onSubmit={savePw} noValidate>
              <Field label="Mật khẩu hiện tại" error={errs.cur}>
                <PasswordInput value={pw.cur} onChange={(e) => setPwField('cur', e.target.value)} placeholder="Nhập mật khẩu hiện tại" error={errs.cur} />
              </Field>
              <Field label="Mật khẩu mới" error={errs.next}>
                <PasswordInput value={pw.next} onChange={(e) => setPwField('next', e.target.value)} placeholder="Tối thiểu 6 ký tự" error={errs.next} autoComplete="new-password" />
              </Field>
              {pw.next && <PwMeter value={pw.next} />}
              <Field label="Xác nhận mật khẩu mới" error={errs.confirm}>
                <PasswordInput value={pw.confirm} onChange={(e) => setPwField('confirm', e.target.value)} placeholder="Nhập lại mật khẩu mới" error={errs.confirm} autoComplete="new-password" />
              </Field>
              <div className="flex gap-2.5 justify-end">
                <Button type="button" variant="ghost" onClick={() => { setChangingPw(false); setPw({ cur: '', next: '', confirm: '' }); setErrs({}) }}>Huỷ</Button>
                <Button type="submit" loading={savingPw}>Đổi mật khẩu</Button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
