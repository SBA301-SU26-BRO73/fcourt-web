import { CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { Button, Field, Logo, PasswordInput, PwMeter } from '@/components/auth/auth-ui'
import { HeroPanel } from '@/components/auth/hero-panel'
import { getApiErrorMessage } from '@/common/utils/api-error'
import { useResetPassword } from '@/hooks/use-auth'
import { validateNewPassword } from './reset-password.utils'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token')?.trim() ?? ''
  const reset = useResetPassword()
  const [f, setF] = useState({ password: '', confirm: '' })
  const [errs, setErrs] = useState<Record<string, string>>({})
  const [done, setDone] = useState(false)

  const set = (k: string, v: string) => {
    setF((x) => ({ ...x, [k]: v }))
    setErrs((e) => ({ ...e, [k]: '' }))
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault()
    const e = validateNewPassword(f.password, f.confirm)
    if (Object.keys(e).length) { setErrs(e); return }
    try {
      await reset.mutateAsync({ token, newPassword: f.password })
      setDone(true)
    } catch (error) {
      setErrs({ form: getApiErrorMessage(error, 'Không thể đặt lại mật khẩu. Vui lòng thử lại.') })
    }
  }

  return (
    <div className="grid md:grid-cols-[46fr_54fr] h-screen overflow-hidden bg-white">
      <HeroPanel variant="forgot" />
      <div className="overflow-y-auto flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <Logo />
          </div>

          {done ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} className="text-green-600" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Đã đặt lại mật khẩu</h1>
              <p className="text-sm text-slate-500 mb-6">Bạn có thể đăng nhập bằng mật khẩu mới.</p>
              <Button block onClick={() => navigate('/auth/login?role=customer')}>Đăng nhập</Button>
            </div>
          ) : !token ? (
            <div className="text-center">
              <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Link không hợp lệ</h1>
              <p className="text-sm text-slate-500 mb-6">Link đặt lại mật khẩu thiếu mã xác thực hoặc đã bị cắt. Hãy yêu cầu link mới.</p>
              <Link to="/auth/forgot-password">
                <Button block>Gửi lại link đặt lại</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <div className="text-xs font-semibold text-green-600 uppercase tracking-widest mb-1">Đặt lại mật khẩu</div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-0.5">Tạo mật khẩu mới</h1>
                <p className="text-sm text-slate-500">Nhập mật khẩu mới cho tài khoản của bạn.</p>
              </div>
              <form onSubmit={submit} noValidate>
                {errs.form && (
                  <div role="alert" className="mb-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                    {errs.form}{' '}
                    <Link to="/auth/forgot-password" className="font-semibold underline">Yêu cầu link mới</Link>
                  </div>
                )}
                <Field label="Mật khẩu mới" error={errs.password}>
                  <PasswordInput value={f.password} onChange={(e) => set('password', e.target.value)} placeholder="Tối thiểu 8 ký tự" error={errs.password} autoComplete="new-password" />
                </Field>
                <PwMeter value={f.password} />
                <Field label="Xác nhận mật khẩu" error={errs.confirm}>
                  <PasswordInput value={f.confirm} onChange={(e) => set('confirm', e.target.value)} placeholder="Nhập lại mật khẩu mới" error={errs.confirm} autoComplete="new-password" />
                </Field>
                <Button type="submit" block lg loading={reset.isPending}>Đặt lại mật khẩu</Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
