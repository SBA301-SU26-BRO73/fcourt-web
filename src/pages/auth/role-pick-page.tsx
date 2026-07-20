import { Building2, ChevronRight, ShieldCheck, User, UserCog } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { HeroPanel } from '@/components/auth/hero-panel'
import { Logo } from '@/components/auth/auth-ui'

interface RoleCardProps {
  icon: React.ElementType
  title: string
  desc: string
  onClick: () => void
}

interface RoleOption {
  icon: React.ElementType
  title: string
  desc: string
  loginPath: string
}

function RoleCard({ icon: Icon, title, desc, onClick }: RoleCardProps) {
  const [hov, setHov] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={[
        'flex items-center gap-4 w-full text-left rounded-xl border p-4 transition cursor-pointer',
        hov
          ? 'border-green-500 bg-green-50 shadow-md shadow-green-500/10'
          : 'border-slate-200 bg-white shadow-sm',
      ].join(' ')}
    >
      <div
        className={[
          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition',
          hov ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700',
        ].join(' ')}
      >
        <Icon size={22} />
      </div>
      <div className="flex-1">
        <div className="font-bold text-[15px] text-slate-900 mb-0.5">{title}</div>
        <div className="text-[13px] text-slate-500 leading-relaxed">{desc}</div>
      </div>
      <ChevronRight
        size={17}
        className={`flex-shrink-0 transition ${hov ? 'text-green-600' : 'text-slate-300'}`}
      />
    </button>
  )
}

const ROLE_OPTIONS = [
  {
    icon: User,
    title: 'Khách hàng',
    desc: 'Tìm kiếm và đặt sân thể thao gần bạn',
    loginPath: '/auth/login?role=customer',
  },
  {
    icon: Building2,
    title: 'Chủ sân / Đối tác',
    desc: 'Quản lý sân, lịch đặt và theo dõi doanh thu',
    loginPath: '/auth/login?role=admin',
  },
  {
    icon: UserCog,
    title: 'Nhân viên',
    desc: 'Tiếp nhận khách, check-in và xử lý vận hành tại sân',
    loginPath: '/auth/login?role=staff',
  },
  {
    icon: ShieldCheck,
    title: 'Super Admin',
    desc: 'Giám sát hệ thống, duyệt đối tác và cấu hình nền tảng',
    loginPath: '/auth/login?role=super-admin',
  },
] satisfies RoleOption[]

export function RolePickPage() {
  const navigate = useNavigate()
  return (
    <div className="grid md:grid-cols-[46fr_54fr] h-screen overflow-hidden bg-white">
      <HeroPanel variant="login" />
      <div className="overflow-y-auto flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <Logo />
          </div>
          <div className="mb-6">
            <div className="text-xs font-semibold text-green-600 uppercase tracking-widest mb-2">
              Chào mừng đến FCourt
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
              Bạn là ai?
            </h1>
            <p className="text-sm text-slate-500">
              Chọn vai trò của bạn để đăng nhập hoặc tạo tài khoản
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {ROLE_OPTIONS.map((role) => (
              <RoleCard
                key={role.loginPath}
                icon={role.icon}
                title={role.title}
                desc={role.desc}
                onClick={() => navigate(role.loginPath)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
