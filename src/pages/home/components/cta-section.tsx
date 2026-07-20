import { useNavigate } from 'react-router-dom'

export default function CtaSection() {
  const navigate = useNavigate()

  return (
    <section className="py-16 px-4 md:px-16">
      <div className="max-w-7xl mx-auto bg-[#006d38] rounded-[40px] p-8 sm:p-16 text-center text-white relative overflow-hidden shadow-2xl">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            Sẵn sàng ra sân ngay hôm nay?
          </h2>

          <p className="text-base sm:text-lg opacity-90 leading-relaxed">
            Tham gia cùng cộng đồng 50,000+ vận động viên và bắt đầu hành trình
            chinh phục sân đấu của bạn.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/branches')}
              className="bg-white hover:bg-gray-100 active:scale-95 text-[#006d38] px-8 py-4 rounded-xl font-bold text-base shadow-xl flex items-center justify-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-xl">
                sports_tennis
              </span>
              Tìm sân ngay
            </button>

            <button
              onClick={() => navigate('/auth/register-admin')}
              className="bg-white/15 hover:bg-white/25 active:scale-95 text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all"
            >
              Đăng ký chủ sân
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
