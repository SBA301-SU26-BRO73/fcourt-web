import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Building2, ChevronRight, KeyRound, LogOut, Mail, Pencil, Phone, Trophy, User, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button, Field, PasswordInput, TextInput } from '@/components/auth/auth-ui'
import { getApiErrorMessage } from '@/common/utils/api-error'
import { useAdminDashboard } from '@/hooks/use-admin-dashboard'
import { useAuth } from '@/hooks/use-auth-context'
import type { UserRole } from '@/types/auth'
import { changePassword, getProfile, updateProfile } from '@/services/auth/auth.service'
import { AvatarEditor } from './avatar-editor'
import { getCourts } from '@/services/court/court.api'
import type { Court, CourtStatus } from '@/types/court'
import { tokenStorage } from '@/utils/token'
import { validators } from '@/utils/validators'

const ROLE_LABEL: Record<UserRole, string> = {
  CUSTOMER: 'Khách hàng',
  ADMIN: 'Chủ sân',
  SUPER_ADMIN: 'Super Admin',
  STAFF: 'Nhân viên',
}

const COURT_STATUS_LABEL: Record<CourtStatus, string> = {
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Ngừng hoạt động',
  MAINTENANCE: 'Bảo trì',
}

const COURT_STATUS_CLASS: Record<CourtStatus, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  INACTIVE: 'bg-slate-100 text-slate-600 ring-slate-200',
  MAINTENANCE: 'bg-amber-50 text-amber-700 ring-amber-100',
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
  const { user, isLoggedIn, clearAuth, logout: logoutSession } = useAuth()
  const hasRecoverableSession = !!tokenStorage.getAccessToken() || !!tokenStorage.getRefreshToken()

  useEffect(() => {
    if (!isLoggedIn || !hasRecoverableSession) {
      if (isLoggedIn && !hasRecoverableSession) clearAuth()
      navigate(getProfileLoginPath(user?.role), { replace: true })
    }
  }, [clearAuth, hasRecoverableSession, isLoggedIn, navigate, user?.role])

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
  const [showCourts, setShowCourts] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const [changingPassword, setChangingPassword] = useState(false)
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [pwErrs, setPwErrs] = useState<Record<string, string>>({})
  const [pwSaving, setPwSaving] = useState(false)

  const setField = (k: string, v: string) => { setF((x) => ({ ...x, [k]: v })); setErrs((e) => ({ ...e, [k]: '' })) }
  const setPwField = (k: string, v: string) => { setPw((x) => ({ ...x, [k]: v })); setPwErrs((e) => ({ ...e, [k]: '' })) }

  const initials = f.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  const roleLabel = user ? (ROLE_LABEL[user.role] ?? user.role) : ''
  const isCustomer = user?.role === 'CUSTOMER'
  const isAdmin = user?.role === 'ADMIN'
  const adminDashboard = useAdminDashboard(isAdmin)
  const topCourt = adminDashboard.data?.topCourts[0] ?? null
  const courtListQuery = useQuery({
    queryKey: ['profile-admin-courts'],
    queryFn: () =>
      getCourts({
        page: 0,
        size: 200,
        sortField: 'name',
        sortDirection: 'asc',
      }),
    enabled: isAdmin && showCourts,
  })
  const ownerCourts = courtListQuery.data?.content ?? []

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
        if (!active) return
        tokenStorage.setUser({ id: response.id, email: response.email, role: response.role, fullName: response.fullName })
        setAvatarUrl(response.avatarUrl ?? null)
        setF({
          name: response.fullName ?? '',
          phone: response.phone ?? '',
          email: response.email,
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
      setF({ name: response.fullName ?? '', phone: response.phone ?? '', email: response.email })
      setEditing(false)
      showToast('Cập nhật thông tin thành công!')
    } catch (error) {
      setErrs({ form: error instanceof Error ? error.message : 'Không thể cập nhật thông tin.' })
    } finally {
      setSaving(false)
    }
  }

  async function savePassword(ev: React.FormEvent) {
    ev.preventDefault()
    const e: Record<string, string> = {}
    if (!pw.current) e.current = 'Vui lòng nhập mật khẩu hiện tại'
    if (pw.next.length < 6) e.next = 'Mật khẩu mới phải từ 6 ký tự'
    if (pw.confirm !== pw.next) e.confirm = 'Xác nhận mật khẩu không khớp'
    if (Object.keys(e).length) { setPwErrs(e); return }

    setPwSaving(true)
    try {
      await changePassword({ currentPassword: pw.current, newPassword: pw.next })
      setPw({ current: '', next: '', confirm: '' })
      setChangingPassword(false)
      showToast('Đổi mật khẩu thành công!')
    } catch (error) {
      setPwErrs({ form: getApiErrorMessage(error, 'Không thể đổi mật khẩu.') })
    } finally {
      setPwSaving(false)
    }
  }

  async function logout() {
    await logoutSession()
    navigate('/auth/role-pick')
  }

  if (!isLoggedIn || !hasRecoverableSession || !user) return null

  const infoRows = [
    { label: 'Họ và tên', val: f.name, icon: User },
    { label: 'Số điện thoại', val: f.phone || '—', icon: Phone },
    { label: 'Email', val: f.email, icon: Mail },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {toast && <Toast msg={toast} />}
      {/* Header */}
      {isCustomer ? (
        <header className="border-b border-[#e1e3e4] bg-white px-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] md:px-12">
          <div className="mx-auto flex h-20 items-center justify-between">
            <div className="flex items-center gap-8">
              <button type="button" onClick={() => navigate('/')} className="text-2xl font-bold tracking-tight text-[#2e7d32]">FCourt</button>
            </div>
            <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
              <button type="button" onClick={() => navigate('/branches')} className="text-base font-semibold text-[#41493e] transition-colors hover:text-[#2e7d32]">Địa điểm</button>
              <button type="button" onClick={() => navigate('/my-bookings')} className="text-base font-semibold text-[#41493e] transition-colors hover:text-[#2e7d32]">Lịch sử đặt sân</button>
            </nav>
            <div className="flex items-center gap-3 md:gap-4">
              <button type="button" className="flex items-center gap-2 rounded-full border border-[#c0c9bb] bg-[#f3f4f5] px-4 py-2 text-sm font-semibold text-[#2e7d32]">
                <span className="material-symbols-outlined">account_circle</span><span>Tài khoản</span>
              </button>
              <button type="button" onClick={logout} className="hidden text-sm font-semibold text-[#667267] transition-colors hover:text-[#2e7d32] sm:block">Đăng xuất</button>
            </div>
          </div>
        </header>
      ) : (
      <header className="border-b border-slate-200 bg-white px-6">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(getProfileBackPath(user.role))}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Quay lại</span>
            </button>
            <button type="button" onClick={() => navigate('/')} className="text-2xl font-bold tracking-tight text-green-700">
              FCourt
            </button>
          </div>
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
      )}

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
              <AvatarEditor
                avatarUrl={avatarUrl}
                initials={initials}
                onChanged={(profile, message) => { setAvatarUrl(profile.avatarUrl ?? null); showToast(message) }}
              />
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

        {isAdmin && (
          <FeaturedCourtCard
            topCourt={topCourt}
            isLoading={adminDashboard.isLoading}
            isError={adminDashboard.isError}
            onOpen={() => setShowCourts(true)}
          />
        )}

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

        {/* Change password */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 font-bold text-[15px] text-slate-900">
              <KeyRound size={17} className="text-green-600" /> Đổi mật khẩu
            </div>
            {!changingPassword && (
              <Button variant="ghost" onClick={() => { setChangingPassword(true); setPwErrs({}) }}>
                <Pencil size={14} /> Đổi mật khẩu
              </Button>
            )}
          </div>
          {changingPassword && (
            <form onSubmit={savePassword} noValidate>
              {pwErrs.form && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{pwErrs.form}</div>}
              <Field label="Mật khẩu hiện tại" error={pwErrs.current}>
                <PasswordInput value={pw.current} onChange={(e) => setPwField('current', e.target.value)} error={pwErrs.current} placeholder="Nhập mật khẩu hiện tại" />
              </Field>
              <Field label="Mật khẩu mới" error={pwErrs.next}>
                <PasswordInput value={pw.next} onChange={(e) => setPwField('next', e.target.value)} error={pwErrs.next} placeholder="Tối thiểu 6 ký tự" />
              </Field>
              <Field label="Xác nhận mật khẩu mới" error={pwErrs.confirm}>
                <PasswordInput value={pw.confirm} onChange={(e) => setPwField('confirm', e.target.value)} error={pwErrs.confirm} placeholder="Nhập lại mật khẩu mới" />
              </Field>
              <div className="flex gap-2.5 justify-end">
                <Button type="button" variant="ghost" onClick={() => { setChangingPassword(false); setPw({ current: '', next: '', confirm: '' }); setPwErrs({}) }}>Huỷ</Button>
                <Button type="submit" loading={pwSaving}>Đổi mật khẩu</Button>
              </div>
            </form>
          )}
        </div>

      </main>
      {showCourts && (
        <CourtListModal
          courts={ownerCourts}
          topCourtId={topCourt?.courtId ?? null}
          isLoading={courtListQuery.isLoading}
          isError={courtListQuery.isError}
          onClose={() => setShowCourts(false)}
          onManage={() => navigate('/admin/courts')}
        />
      )}
    </div>
  )
}

function FeaturedCourtCard({
  topCourt,
  isLoading,
  isError,
  onOpen,
}: {
  topCourt: { courtId: number | null; courtName: string; branchName: string; bookingCount: number; bookedSlots: number; revenue: number } | null
  isLoading: boolean
  isError: boolean
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
            <Trophy size={22} />
          </div>
          <div>
            <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">Sân nổi bật</div>
            {isLoading ? (
              <div className="mt-2 h-5 w-44 animate-pulse rounded bg-slate-100" />
            ) : isError ? (
              <div className="mt-2 text-sm font-bold text-red-600">Không thể tải thông tin sân nổi bật</div>
            ) : topCourt ? (
              <>
                <div className="mt-1 text-lg font-extrabold text-slate-900">{topCourt.courtName}</div>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                  <Building2 size={14} />
                  {topCourt.branchName}
                </div>
              </>
            ) : (
              <div className="mt-2 text-sm font-bold text-slate-600">Chưa có sân nổi bật</div>
            )}
          </div>
        </div>
        <ChevronRight size={20} className="mt-2 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-600" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <MiniStat label="Bookings" value={topCourt ? String(topCourt.bookingCount) : '-'} />
        <MiniStat label="Slots" value={topCourt ? String(topCourt.bookedSlots) : '-'} />
        <MiniStat label="Revenue" value={topCourt ? formatVnd(topCourt.revenue) : '-'} />
      </div>
    </button>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</div>
      <div className="mt-1 truncate text-sm font-extrabold text-slate-900">{value}</div>
    </div>
  )
}

function CourtListModal({
  courts,
  topCourtId,
  isLoading,
  isError,
  onClose,
  onManage,
}: {
  courts: Court[]
  topCourtId: number | null
  isLoading: boolean
  isError: boolean
  onClose: () => void
  onManage: () => void
}) {
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-8">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-extrabold text-slate-950">Danh sách sân của chủ sân</h2>
            <p className="mt-1 text-sm text-slate-500">Sân nổi bật được đánh dấu dựa trên lượt đặt cao nhất.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Đóng popup">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-6 text-center text-sm font-bold text-red-700">
              Không thể tải danh sách sân.
            </div>
          ) : courts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
              <div className="text-sm font-bold text-slate-700">Chủ sân này chưa có sân nào.</div>
              <div className="mt-1 text-xs text-slate-500">Tạo sân trong khu vực Admin để hiển thị tại đây.</div>
            </div>
          ) : (
            <div className="space-y-3">
              {courts.map((court) => {
                const highlighted = court.id === topCourtId
                return (
                  <div key={court.id} className={`rounded-xl border px-4 py-3 ${highlighted ? 'border-amber-200 bg-amber-50/60' : 'border-slate-100 bg-white'}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-extrabold text-slate-900">{court.name}</h3>
                          {highlighted && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-700">Nổi bật</span>}
                        </div>
                        <div className="mt-1 text-xs font-medium text-slate-500">{court.branchName} · {court.courtTypeName}</div>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${COURT_STATUS_CLASS[court.status]}`}>
                        {COURT_STATUS_LABEL[court.status]}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100">
            Đóng
          </button>
          <button type="button" onClick={onManage} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700">
            Quản lý sân
          </button>
        </div>
      </div>
    </div>
  )
}

function formatVnd(value: number) {
  if (!value) return '0đ'
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}tr`
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`
  return `${value.toLocaleString('vi-VN')}đ`
}
function getProfileBackPath(role: UserRole) {
  const paths: Record<UserRole, string> = {
    ADMIN: '/admin/dashboard',
    SUPER_ADMIN: '/super-admin',
    STAFF: '/staff',
    CUSTOMER: '/',
  }

  return paths[role] ?? '/'
}

function getProfileLoginPath(currentRole?: UserRole) {
  const role = currentRole ?? tokenStorage.getLastRole() ?? 'CUSTOMER'
  const params: Record<UserRole, string> = {
    ADMIN: 'admin',
    SUPER_ADMIN: 'super-admin',
    STAFF: 'staff',
    CUSTOMER: 'customer',
  }

  return `/auth/login?role=${params[role]}`
}
