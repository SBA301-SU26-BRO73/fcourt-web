import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth-context'

export default function MobileBottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoggedIn } = useAuth()

  const isHome = location.pathname === '/'
  const isBranches = location.pathname.startsWith('/branches')
  const isBookings = location.pathname.startsWith('/booking-lookup') || location.pathname.startsWith('/my-bookings')
  const isProfile = location.pathname.startsWith('/profile') || location.pathname.startsWith('/auth')

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center h-16 bg-white dark:bg-[#1a1b1f] border-t border-[#bccabc]/30 shadow-[0px_-4px_20px_rgba(0,168,89,0.08)] z-50 px-2 rounded-t-xl">
      <button
        onClick={() => navigate('/')}
        className={`flex flex-col items-center justify-center rounded-xl px-4 py-1 active:scale-95 transition-all ${
          isHome
            ? 'bg-[#00a859]/15 text-[#006d38] dark:text-[#59df89]'
            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        <span
          className="material-symbols-outlined text-2xl"
          style={{ fontVariationSettings: isHome ? "'FILL' 1" : "'FILL' 0" }}
        >
          home
        </span>
        <span className="font-bold text-[10px] mt-0.5">Trang chủ</span>
      </button>

      <button
        onClick={() => navigate('/branches')}
        className={`flex flex-col items-center justify-center rounded-xl px-4 py-1 active:scale-95 transition-all ${
          isBranches
            ? 'bg-[#00a859]/15 text-[#006d38] dark:text-[#59df89]'
            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        <span
          className="material-symbols-outlined text-2xl"
          style={{ fontVariationSettings: isBranches ? "'FILL' 1" : "'FILL' 0" }}
        >
          sports_tennis
        </span>
        <span className="font-bold text-[10px] mt-0.5">Sân đấu</span>
      </button>

      <button
        onClick={() => navigate(isLoggedIn ? '/booking-lookup' : '/booking-lookup')}
        className={`flex flex-col items-center justify-center rounded-xl px-4 py-1 active:scale-95 transition-all ${
          isBookings
            ? 'bg-[#00a859]/15 text-[#006d38] dark:text-[#59df89]'
            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        <span
          className="material-symbols-outlined text-2xl"
          style={{ fontVariationSettings: isBookings ? "'FILL' 1" : "'FILL' 0" }}
        >
          event_available
        </span>
        <span className="font-bold text-[10px] mt-0.5">Lịch đặt</span>
      </button>

      <button
        onClick={() => navigate(isLoggedIn ? '/profile' : '/auth/login?role=customer')}
        className={`flex flex-col items-center justify-center rounded-xl px-4 py-1 active:scale-95 transition-all ${
          isProfile
            ? 'bg-[#00a859]/15 text-[#006d38] dark:text-[#59df89]'
            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        <span
          className="material-symbols-outlined text-2xl"
          style={{ fontVariationSettings: isProfile ? "'FILL' 1" : "'FILL' 0" }}
        >
          person
        </span>
        <span className="font-bold text-[10px] mt-0.5">
          {isLoggedIn ? 'Tài khoản' : 'Đăng nhập'}
        </span>
      </button>
    </nav>
  )
}
