import { Mail } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Button, Field, Logo, TextInput } from '@/components/auth/auth-ui'
import { HeroPanel } from '@/components/auth/hero-panel'
import { validators } from '@/utils/validators'

export function ForgotPage() {
  const [email, setEmail] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function submit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!email.trim()) { setErr('Vui lòng nhập email'); return }
    if (!validators.email(email)) { setErr('Email không đúng định dạng'); return }
    setErr('')
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1300))
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="grid md:grid-cols-[46fr_54fr] h-screen overflow-hidden bg-white">
      <HeroPanel variant="forgot" />
      <div className="overflow-y-auto flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <Logo />
          </div>
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-green-600 mb-5 transition group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
            <span className="group-hover:underline">Quay lại đăng nhập</span>
          </Link>

          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-blue-500" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Kiểm tra email nhé!</h1>
              <p className="text-sm text-slate-500 mb-1">
                Mình đã gửi link đặt lại mật khẩu đến
              </p>
              <p className="text-sm font-semibold text-slate-800 mb-1">{email}</p>
              <p className="text-xs text-slate-400 mb-6">
                Không thấy? Kiểm tra thư mục Spam hoặc thử lại.
              </p>
              <div className="flex flex-col gap-2.5">
                <Button block onClick={() => setSent(false)}>
                  Gửi lại email
                </Button>
                <Link to="/auth/login">
                  <Button block variant="ghost">
                    Quay lại đăng nhập
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <div className="text-xs font-semibold text-green-600 uppercase tracking-widest mb-1">
                  Đặt lại mật khẩu
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-0.5">
                  Quên mật khẩu?
                </h1>
                <p className="text-sm text-slate-500">
                  Nhập email đã đăng ký, mình sẽ gửi link đặt lại mật khẩu ngay.
                </p>
              </div>
              <form onSubmit={submit} noValidate>
                <Field label="Email đã đăng ký" error={err}>
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Mail size={15} />
                  </span>
                  <TextInput
                    hasIcon
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErr('') }}
                    error={err}
                    autoComplete="email"
                  />
                </Field>
                <Button type="submit" block lg loading={loading}>
                  Gửi link đặt lại
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
