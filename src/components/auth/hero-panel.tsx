import { ShieldCheck, Sparkles } from 'lucide-react'

const HERO_PHOTO =
  'https://images.unsplash.com/photo-1678734491865-d4dc8a5f5399?fm=jpg&q=90&w=1400&auto=format&fit=crop&crop=center'

const HERO_COPY = {
  login: {
    kicker: 'Nền tảng #1 Việt Nam',
    headline: 'Đặt sân thể thao\nnhanh chóng &\ntiện lợi nhất',
    sub: 'Hơn 500 sân thể thao trên toàn quốc. Đặt sân trong 30 giây, huỷ miễn phí.',
  },
  customer: {
    kicker: 'Tài khoản Khách hàng',
    headline: 'Tham gia cộng đồng\nthể thao lớn\nnhất Việt Nam',
    sub: 'Đăng ký miễn phí, đặt sân ngay tức thì, nhận thông báo nhanh qua Zalo.',
  },
  admin: {
    kicker: 'Đối tác · Chủ sân',
    headline: 'Đưa sân của bạn\nlên nền tảng\nFCourt',
    sub: 'Tiếp cận 50,000+ người chơi. Quản lý lịch đặt sân và doanh thu trực quan.',
  },
  forgot: {
    kicker: 'Hỗ trợ tài khoản',
    headline: 'Lấy lại\nquyền truy cập\ntài khoản',
    sub: 'Chúng mình sẽ gửi link đặt lại mật khẩu qua email đã đăng ký của bạn.',
  },
}

function CourtLines() {
  const court = (cx: number, cy: number, rot: number, scale: number, op: number) => (
    <g transform={`translate(${cx},${cy}) rotate(${rot}) scale(${scale})`} opacity={op}>
      <rect x="-50" y="-110" width="100" height="220" fill="rgba(255,255,255,.02)" rx="2" />
      <rect
        x="-50"
        y="-110"
        width="100"
        height="220"
        fill="none"
        stroke="rgba(255,255,255,.18)"
        strokeWidth="1.8"
      />
      <line x1="-50" y1="0" x2="50" y2="0" stroke="rgba(255,255,255,.35)" strokeWidth="2.5" />
      <circle cx="-53" cy="0" r="2.5" fill="rgba(255,255,255,.3)" />
      <circle cx="53" cy="0" r="2.5" fill="rgba(255,255,255,.3)" />
      <line x1="-50" y1="-35" x2="50" y2="-35" stroke="rgba(255,255,255,.15)" strokeWidth="1.3" />
      <line x1="-50" y1="35" x2="50" y2="35" stroke="rgba(255,255,255,.15)" strokeWidth="1.3" />
      <line x1="0" y1="-110" x2="0" y2="-35" stroke="rgba(255,255,255,.12)" strokeWidth="1.3" />
      <line x1="0" y1="35" x2="0" y2="110" stroke="rgba(255,255,255,.12)" strokeWidth="1.3" />
    </g>
  )
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 440 800"
      preserveAspectRatio="xMidYMid slice"
    >
      {court(220, 400, -6, 1.9, 1)}
      {court(360, 170, 14, 0.62, 0.28)}
      {court(75, 640, -10, 0.5, 0.18)}
    </svg>
  )
}

type HeroVariant = keyof typeof HERO_COPY

interface HeroPanelProps {
  variant?: HeroVariant
}

export function HeroPanel({ variant = 'login' }: HeroPanelProps) {
  const { kicker, headline, sub } = HERO_COPY[variant] ?? HERO_COPY.login
  return (
    <div className="relative overflow-hidden bg-[linear-gradient(140deg,#1fae5f_0%,#0e9d57_55%,#0b8a4d_100%)] h-screen hidden md:flex flex-col">
      <img
        src={HERO_PHOTO}
        alt=""
        loading="eager"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <CourtLines />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,44,25,.48)_0%,rgba(5,40,22,.20)_42%,rgba(4,32,18,.72)_100%)] pointer-events-none" />
      <div className="relative z-10 flex flex-col justify-between h-full p-10 text-white">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/25 text-white flex-shrink-0">
            <ShieldCheck size={18} />
          </span>
          <span>
            <div className="font-bold text-base tracking-tight">FCourt</div>
            <div className="text-xs text-white/70">Đặt sân thể thao thông minh</div>
          </span>
        </div>
        {/* Headline */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-white/80 uppercase">
            <Sparkles size={13} />
            {kicker}
          </div>
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
            {headline.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
          </h2>
          <p className="text-sm text-white/75 leading-relaxed max-w-xs">{sub}</p>
          {/* Stats */}
          <div className="flex gap-8 pt-4 border-t border-white/15">
            {[
              { n: '500+', l: 'Sân thể thao' },
              { n: '50K+', l: 'Người dùng' },
              { n: '4.9★', l: 'Đánh giá' },
            ].map(({ n, l }) => (
              <div key={l}>
                <div className="text-xl font-bold">{n}</div>
                <div className="text-xs text-white/60">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
