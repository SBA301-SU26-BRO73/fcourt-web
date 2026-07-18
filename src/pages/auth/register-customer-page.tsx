import { Mail, Phone, User } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  Button,
  Check,
  Field,
  Logo,
  PasswordInput,
  PwMeter,
  TextInput,
} from '@/components/auth/auth-ui'
import { HeroPanel } from '@/components/auth/hero-panel'
import { useRegisterCustomer } from '@/hooks/use-auth'
import { validators } from '@/utils/validators'

export function RegisterCustomerPage() {
  const [f, setF] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirm: '',
    agree: false,
  })
  const [errs, setErrs] = useState<Record<string, string>>({})
  const register = useRegisterCustomer()

  const set = (k: string, v: string | boolean) => {
    setF((x) => ({ ...x, [k]: v }))
    setErrs((e) => ({ ...e, [k]: '' }))
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!f.fullName.trim()) e.fullName = 'Vui lòng nhập họ tên'
    if (!f.phone.trim()) e.phone = 'Vui lòng nhập số điện thoại'
    else if (!validators.phone(f.phone)) e.phone = 'Số điện thoại không hợp lệ (VD: 0901234567)'
    if (!f.email.trim()) e.email = 'Vui lòng nhập email'
    else if (!validators.email(f.email)) e.email = 'Email không đúng định dạng'
    if (!f.password) e.password = 'Vui lòng nhập mật khẩu'
    else if (f.password.length < 6) e.password = 'Mật khẩu tối thiểu 6 ký tự'
    if (f.password !== f.confirm) e.confirm = 'Mật khẩu xác nhận không khớp'
    if (!f.agree) e.agree = 'Bạn cần đồng ý với điều khoản'
    return e
  }

  function submit(ev: React.FormEvent) {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrs(e); return }
    register.mutate({
      fullName: f.fullName,
      phone: f.phone,
      email: f.email,
      password: f.password,
    })
  }

  const serverError =
    register.error instanceof Error
      ? (register.error as any).response?.data?.message ?? register.error.message
      : null

  return (
    <div className="grid md:grid-cols-[46fr_54fr] h-screen overflow-hidden bg-white">
      <HeroPanel variant="customer" />
      <div className="overflow-y-auto flex items-start justify-center p-6 pt-10">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <Logo />
          </div>
          <Link
            to="/auth/login?role=customer"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-green-600 mb-5 transition group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
            <span className="group-hover:underline">Quay lại đăng nhập</span>
          </Link>
          <div className="mb-5">
            <div className="text-xs font-semibold text-green-600 uppercase tracking-widest mb-1">
              Tài khoản Khách hàng
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-0.5">
              Tạo tài khoản
            </h1>
            <p className="text-sm text-slate-500">Đăng ký miễn phí, đặt sân ngay tức thì</p>
          </div>
          <form onSubmit={submit} noValidate>
            <Field label="Họ và tên" error={errs.fullName}>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <User size={15} />
              </span>
              <TextInput
                hasIcon
                placeholder="Nguyễn Văn A"
                value={f.fullName}
                onChange={(e) => set('fullName', e.target.value)}
                error={errs.fullName}
                autoComplete="name"
              />
            </Field>
            <div className="grid grid-cols-2 gap-x-3.5">
              <Field label="Số điện thoại" error={errs.phone}>
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
            </div>
            <Field label="Mật khẩu" error={errs.password}>
              <PasswordInput
                value={f.password}
                onChange={(e) => set('password', e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                error={errs.password}
                autoComplete="new-password"
              />
            </Field>
            {f.password && <PwMeter value={f.password} />}
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
              <Check alignTop checked={f.agree} onChange={(v) => set('agree', v)}>
                <span>
                  Tôi đồng ý với{' '}
                  <a href="#" onClick={(e) => e.preventDefault()} className="text-green-600 hover:underline">
                    Điều khoản dịch vụ
                  </a>{' '}
                  và{' '}
                  <a href="#" onClick={(e) => e.preventDefault()} className="text-green-600 hover:underline">
                    Chính sách bảo mật
                  </a>{' '}
                  của FCourt
                </span>
              </Check>
              {errs.agree && (
                <div className="mt-1.5 text-xs text-red-500">{errs.agree}</div>
              )}
            </div>
            {serverError && (
              <div className="mb-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                {serverError}
              </div>
            )}
            <Button type="submit" block lg loading={register.isPending}>
              Tạo tài khoản
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-slate-500">
            Đã có tài khoản?{' '}
            <Link to="/auth/login?role=customer" className="text-green-600 font-semibold hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
