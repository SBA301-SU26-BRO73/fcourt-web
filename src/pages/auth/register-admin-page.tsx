import { CheckCircle, Clock, Mail, Phone } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  Button,
  Field,
  Logo,
  PasswordInput,
  TextInput,
} from '@/components/auth/auth-ui'
import { HeroPanel } from '@/components/auth/hero-panel'
import { UploadZone } from '@/components/auth/upload-zone'
import { useRegisterCourtOwner } from '@/hooks/use-auth'
import { validators } from '@/utils/validators'

export function RegisterAdminPage() {
  const [f, setF] = useState({ email: '', phone: '', password: '', confirm: '' })
  const [docs, setDocs] = useState<File[]>([])
  const [photos, setPhotos] = useState<File[]>([])
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [done, setDone] = useState(false)

  const register = useRegisterCourtOwner(() => setDone(true))

  const set = (k: string, v: string) => {
    setF((x) => ({ ...x, [k]: v }))
    setErrs((e) => ({ ...e, [k]: '' }))
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!f.email.trim()) e.email = 'Vui lòng nhập email'
    else if (!validators.email(f.email)) e.email = 'Email không đúng định dạng'
    if (!f.phone.trim()) e.phone = 'Vui lòng nhập số điện thoại'
    else if (!validators.phone(f.phone)) e.phone = 'Số điện thoại không hợp lệ'
    if (!f.password) e.password = 'Vui lòng nhập mật khẩu'
    else if (f.password.length < 8) e.password = 'Mật khẩu tối thiểu 8 ký tự'
    if (f.password !== f.confirm) e.confirm = 'Mật khẩu không khớp'
    if (docs.length === 0) e.docs = 'Vui lòng tải lên ít nhất 1 giấy tờ'
    return e
  }

  function submit(ev: React.FormEvent) {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrs(e); return }
    const data = new FormData()
    data.append('email', f.email)
    data.append('phone', f.phone)
    data.append('password', f.password)
    docs.forEach((d) => data.append('legalDocuments', d))
    photos.forEach((p) => data.append('courtImages', p))
    register.mutate(data)
  }

  if (done) {
    return (
      <div className="grid md:grid-cols-[46fr_54fr] h-screen overflow-hidden bg-white">
        <HeroPanel variant="admin" />
        <div className="overflow-y-auto flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <Logo />
            </div>
            {/* Success card */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={30} className="text-green-600" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
                Đã gửi đăng ký!
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed mb-5">
                Hồ sơ đang được FCourt xem xét.<br />Kết quả sẽ được thông báo qua:
              </p>
              <div className="flex justify-center gap-2.5 mb-5">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                  <Mail size={13} /> Email
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-green-50 text-green-700 border border-green-200">
                  <Phone size={13} /> Zalo / SĐT
                </span>
              </div>
              <div className="text-xs text-slate-400 pb-6 border-b border-slate-200 mb-6">
                Thời gian xét duyệt: <b className="text-slate-600">1–3 ngày làm việc</b>
              </div>
              <Link to="/auth/login?role=admin">
                <Button block variant="ghost">
                  Quay lại đăng nhập
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const serverError =
    register.error instanceof Error
      ? (register.error as any).response?.data?.message ?? register.error.message
      : null

  return (
    <div className="grid md:grid-cols-[46fr_54fr] h-screen overflow-hidden bg-white">
      <HeroPanel variant="admin" />
      <div className="overflow-y-auto flex items-start justify-center p-6 pt-10">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <Logo />
          </div>
          <Link
            to="/auth/login?role=admin"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-green-600 mb-5 transition group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
            <span className="group-hover:underline">Quay lại đăng nhập</span>
          </Link>
          <div className="mb-5">
            <div className="text-xs font-semibold text-green-600 uppercase tracking-widest mb-1">
              Tài khoản Chủ sân
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-0.5">
              Đăng ký đối tác
            </h1>
            <p className="text-sm text-slate-500">
              Đưa sân của bạn lên FCourt, tiếp cận hàng ngàn người chơi
            </p>
          </div>
          {/* Notice */}
          <div className="flex gap-3 p-3.5 mb-5 rounded-xl bg-amber-50 border border-amber-200">
            <Clock size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-amber-900 mb-0.5">
                Đăng ký cần xét duyệt
              </div>
              <div className="text-xs text-amber-700 leading-relaxed">
                Sau khi gửi hồ sơ, đội ngũ FCourt sẽ xem xét trong{' '}
                <b>1–3 ngày làm việc</b> và thông báo qua email hoặc Zalo/SĐT.
              </div>
            </div>
          </div>
          <form onSubmit={submit} noValidate>
            <div className="grid grid-cols-2 gap-x-3.5">
              <Field label="Email" error={errs.email}>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Mail size={15} />
                </span>
                <TextInput
                  hasIcon
                  type="email"
                  placeholder="you@example.com"
                  value={f.email}
                  onChange={(e) => set('email', e.target.value)}
                  error={errs.email}
                  autoComplete="email"
                />
              </Field>
              <Field label="SĐT / Zalo" error={errs.phone}>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Phone size={15} />
                </span>
                <TextInput
                  hasIcon
                  type="tel"
                  placeholder="0901 234 567"
                  value={f.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  error={errs.phone}
                  autoComplete="tel"
                />
              </Field>
            </div>
            <Field label="Mật khẩu" error={errs.password}>
              <PasswordInput
                value={f.password}
                onChange={(e) => set('password', e.target.value)}
                placeholder="Tối thiểu 8 ký tự"
                error={errs.password}
                autoComplete="new-password"
              />
            </Field>
            <Field label="Xác nhận mật khẩu" error={errs.confirm}>
              <PasswordInput
                value={f.confirm}
                onChange={(e) => set('confirm', e.target.value)}
                placeholder="Nhập lại mật khẩu"
                error={errs.confirm}
                autoComplete="new-password"
              />
            </Field>
            <div className="mb-4">
              <div className="text-sm font-semibold text-slate-700 mb-1.5">
                Giấy tờ pháp lý{' '}
                <span className="text-xs font-normal text-slate-400">CMND · CCCD · GPKD</span>
              </div>
              <UploadZone
                hint="PDF, JPG, PNG · Tối đa 5 file"
                accept="image/*,.pdf"
                files={docs}
                onChange={setDocs}
              />
              {errs.docs && (
                <div className="mt-1.5 text-xs text-red-500">{errs.docs}</div>
              )}
            </div>
            <div className="mb-4">
              <div className="text-sm font-semibold text-slate-700 mb-1.5">
                Ảnh sân{' '}
                <span className="text-xs font-normal text-slate-400">Không bắt buộc</span>
              </div>
              <UploadZone
                hint="JPG, PNG · Tối đa 5 ảnh"
                accept="image/*"
                files={photos}
                onChange={setPhotos}
              />
            </div>
            {serverError && (
              <div className="mb-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                {serverError}
              </div>
            )}
            <Button type="submit" block lg loading={register.isPending}>
              Gửi đăng ký
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-slate-500">
            Đã có tài khoản?{' '}
            <Link to="/auth/login?role=admin" className="text-green-600 font-semibold hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
