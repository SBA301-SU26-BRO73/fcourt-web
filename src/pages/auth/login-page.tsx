import { Building2, Mail, ShieldCheck, User, UserCog } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { Button, Check, Field, Logo, PasswordInput, TextInput } from '@/components/auth/auth-ui'
import { HeroPanel } from '@/components/auth/hero-panel'
import type { HeroVariant } from '@/components/auth/hero-panel'
import { useLogin } from '@/hooks/use-auth'
import { validators } from '@/utils/validators'

interface LoginRoleConfig {
  label: string
  icon: React.ElementType
  heroVariant: HeroVariant
  registerPath: string | null
  registerLabel: string | null
}

const LOGIN_ROLE_CONFIG = {
  customer: {
    label: 'Khách hàng',
    icon: User,
    heroVariant: 'login',
    registerPath: '/auth/register/customer',
    registerLabel: 'Đăng ký ngay',
  },
  admin: {
    label: 'Chủ sân / Đối tác',
    icon: Building2,
    heroVariant: 'admin',
    registerPath: '/auth/register/court-owner',
    registerLabel: 'Đăng ký Chủ sân',
  },
  staff: {
    label: 'Nhân viên',
    icon: UserCog,
    heroVariant: 'staff',
    registerPath: null,
    registerLabel: null,
  },
  'super-admin': {
    label: 'Super Admin',
    icon: ShieldCheck,
    heroVariant: 'superAdmin',
    registerPath: null,
    registerLabel: null,
  },
} as const satisfies Record<string, LoginRoleConfig>

type LoginRole = keyof typeof LOGIN_ROLE_CONFIG

function getLoginRoleConfig(role: string | null) {
  if (role && role in LOGIN_ROLE_CONFIG) {
    return LOGIN_ROLE_CONFIG[role as LoginRole]
  }

  return LOGIN_ROLE_CONFIG.customer
}

function getServerErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return null

  const apiError = error as Error & {
    response?: { data?: { message?: unknown } }
  }
  const message = apiError.response?.data?.message

  return typeof message === 'string' ? message : error.message
}

export function LoginPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const roleConfig = getLoginRoleConfig(params.get('role'))
  const RoleIcon = roleConfig.icon
  const roleLabel = roleConfig.label

  const [f, setF] = useState({ email: '', password: '', remember: false })
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [redirectMessage] = useState<string | null>(() => {
    const message = sessionStorage.getItem('fcourt.auth.redirectMessage')
    if (message) sessionStorage.removeItem('fcourt.auth.redirectMessage')
    return message
  })
  const login = useLogin()

  const set = (k: string, v: string | boolean) => {
    setF((x) => ({ ...x, [k]: v }))
    setErrs((e) => ({ ...e, [k]: '' }))
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!f.email.trim()) e.email = 'Vui lòng nhập email'
    else if (!validators.email(f.email)) e.email = 'Email không đúng định dạng'
    if (!f.password) e.password = 'Vui lòng nhập mật khẩu'
    return e
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrs(e); return }
    login.mutate({ email: f.email, password: f.password })
  }

  const serverError = getServerErrorMessage(login.error)

  return (
    <div className="grid md:grid-cols-[46fr_54fr] h-screen overflow-hidden bg-white">
      <HeroPanel variant={roleConfig.heroVariant} />
      <div className="overflow-y-auto flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <Logo />
          </div>
          <button
            type="button"
            onClick={() => navigate('/auth/role-pick')}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-green-600 mb-5 transition group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
            <span className="group-hover:underline">Đổi vai trò</span>
          </button>
          {/* Role badge */}
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 mb-5 rounded-xl bg-green-50 border border-green-200/60">
            <RoleIcon size={15} className="text-green-600 flex-shrink-0" />
            <span className="text-[13px] font-semibold text-green-800">
              Đăng nhập với tư cách: <b>{roleLabel}</b>
            </span>
          </div>
          <div className="mb-5">
            <div className="text-xs font-semibold text-green-600 uppercase tracking-widest mb-1">
              Chào mừng trở lại
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-0.5">
              Đăng nhập
            </h1>
            <p className="text-sm text-slate-500">Đăng nhập vào tài khoản FCourt của bạn</p>
          </div>
          {redirectMessage && (
            <div role="alert" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
              {redirectMessage}
            </div>
          )}
          <form onSubmit={submit} noValidate>
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
            <Field label="Mật khẩu" error={errs.password}>
              <PasswordInput
                value={f.password}
                onChange={(e) => set('password', e.target.value)}
                placeholder="Nhập mật khẩu"
                error={errs.password}
                autoComplete="current-password"
              />
            </Field>
            <div className="flex items-center justify-between mb-4">
              <Check checked={f.remember} onChange={(v) => set('remember', v)}>
                Nhớ tài khoản
              </Check>
              <Link to="/auth/forgot-password" className="text-sm text-green-600 hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
            {serverError && (
              <div className="mb-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                {serverError}
              </div>
            )}
            <Button type="submit" block lg loading={login.isPending}>
              Đăng nhập
            </Button>
          </form>
          {roleConfig.registerPath && roleConfig.registerLabel && (
            <p className="mt-5 text-center text-sm text-slate-500">
              Chưa có tài khoản?{' '}
              <Link
                to={roleConfig.registerPath}
                className="text-green-600 font-semibold hover:underline"
              >
                {roleConfig.registerLabel}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
