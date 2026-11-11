import { Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import type { BranchFilterRequest } from "@/services/branch/branch.api";
import { useAuth } from "@/hooks/use-auth-context";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [, setUrlSearchParams] = useSearchParams();
  const { isLoggedIn, user } = useAuth();
  const accountName = user?.fullName?.trim() || user?.email?.trim() || "Tài khoản";

  const [globalFilters, setGlobalFilters] =
    useState<BranchFilterRequest>({});

  const handleGoHome = () => {
    setGlobalFilters({});
    setUrlSearchParams({});
    navigate("/");
  };

  const handleAccountClick = () => {
    navigate(isLoggedIn ? "/profile" : "/auth/login?role=customer");
  };

  const isHomePage = location.pathname === "/";

  const isBranchListPage =
    location.pathname === "/branches" ||
    location.pathname === "/branches/";
  const isPaymentPage = location.pathname === "/payment";

  const isManagementPage =
    location.pathname.startsWith("/auth/branches") ||
    location.pathname.startsWith("/auth/courts") ||
    location.pathname.startsWith("/auth/time-slots");

  return (
    <div className="bg-background text-on-surface font-body-md selection:bg-primary/20 selection:text-primary min-h-screen flex flex-col">
      {!isManagementPage && (
        <header className="fixed left-0 top-0 z-50 flex h-20 w-full items-center justify-between border-b border-[#e1e3e4] bg-white px-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] md:px-12">
          <div className="flex items-center gap-8">
            <button type="button" onClick={handleGoHome} className="text-2xl font-bold tracking-tight text-[#2e7d32]">FCourt</button>
          </div>
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
            <button type="button" onClick={() => navigate('/branches')} className={`pb-1 text-base font-semibold transition-colors ${isBranchListPage ? 'border-b-2 border-[#2e7d32] text-[#2e7d32]' : 'text-[#41493e] hover:text-[#2e7d32]'}`}>Địa điểm</button>
            <button type="button" onClick={() => navigate('/my-bookings')} className={`pb-1 text-base font-semibold transition-colors ${location.pathname === '/my-bookings' ? 'border-b-2 border-[#2e7d32] text-[#2e7d32]' : 'text-[#41493e] hover:text-[#2e7d32]'}`}>Lịch sử đặt sân</button>
          </nav>
          <div className="flex items-center gap-3 md:gap-4">
            <NotificationBell className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#c0c9bb] bg-[#f3f4f5] text-[#2e7d32] transition-colors hover:bg-[#c8e6c9]" />
            <button type="button" onClick={handleAccountClick} className="flex items-center gap-2 rounded-full border border-[#c0c9bb] bg-[#f3f4f5] px-4 py-2 text-sm font-semibold text-[#2e7d32] transition-colors hover:bg-[#c8e6c9]">
              <span className="material-symbols-outlined">account_circle</span>
              <span>{isLoggedIn ? accountName : "Đăng nhập"}</span>
            </button>
          </div>
        </header>
      )}

      <main
        className={`flex-1 ${
          isManagementPage
            ? ""
              : isBranchListPage
                ? "pt-32 md:pt-24"
                : isPaymentPage
                  ? "pt-20"
                : isHomePage
                ? "pt-20"
                : "pt-24"
        }`}
      >
        <Outlet context={{ globalFilters, setGlobalFilters }} />
      </main>

      {!isManagementPage && !isPaymentPage && (
        <>
          <footer className="bg-[#1a1b1f] text-gray-400 pb-24 pt-16 px-4 md:px-16 border-t border-gray-800">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
              <div className="col-span-1 md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[#77fca3] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                  <span className="font-extrabold text-xl text-[#77fca3]">FCourt</span>
                </div>
                <p className="text-sm leading-relaxed mb-6 text-gray-300">
                  Nền tảng đặt sân thể thao thông minh, mang thể thao đến gần mọi người hơn.
                </p>
                <div className="flex gap-4">
                  <a className="hover:text-[#77fca3] transition-colors" href="#"><span className="material-symbols-outlined">face_nod</span></a>
                  <a className="hover:text-[#77fca3] transition-colors" href="#"><span className="material-symbols-outlined">camera</span></a>
                  <a className="hover:text-[#77fca3] transition-colors" href="#"><span className="material-symbols-outlined">share</span></a>
                </div>
              </div>

              <div>
                <h5 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Dịch vụ</h5>
                <ul className="space-y-2.5 text-sm">
                  <li><button onClick={() => navigate('/branches?keyword=tennis')} className="hover:text-[#77fca3] transition-colors">Đặt sân Tennis</button></li>
                  <li><button onClick={() => navigate('/branches?keyword=badminton')} className="hover:text-[#77fca3] transition-colors">Đặt sân Cầu lông</button></li>
                  <li><button onClick={() => navigate('/branches?keyword=football')} className="hover:text-[#77fca3] transition-colors">Đặt sân Bóng đá</button></li>
                  <li><button onClick={() => navigate('/branches?keyword=pickleball')} className="hover:text-[#77fca3] transition-colors">Đặt sân Pickleball</button></li>
                </ul>
              </div>

              <div>
                <h5 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Về chúng tôi</h5>
                <ul className="space-y-2.5 text-sm">
                  <li><a className="hover:text-[#77fca3] transition-colors" href="#features">Giới thiệu</a></li>
                  <li><a className="hover:text-[#77fca3] transition-colors" href="#">Chính sách bảo mật</a></li>
                  <li><a className="hover:text-[#77fca3] transition-colors" href="#">Điều khoản dịch vụ</a></li>
                  <li><a className="hover:text-[#77fca3] transition-colors" href="#">Liên hệ hỗ trợ</a></li>
                </ul>
              </div>

              <div>
                <h5 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Liên hệ</h5>
                <ul className="space-y-2.5 text-sm">
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-base">mail</span> support@fcourt.vn</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-base">call</span> 1900 123 456</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-base">location_on</span> Quận 1, TP. Hồ Chí Minh</li>
                </ul>
              </div>
            </div>

            <div className="max-w-7xl mx-auto border-t border-gray-800 pt-8 text-center text-xs text-gray-500">
              <p>© 2024 FCourt. Smart Sports Booking. Đã đăng ký bản quyền.</p>
            </div>
          </footer>

          <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-outline-variant/20 bg-surface/90 px-6 pb-safe pt-2 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] backdrop-blur-xl md:hidden">
            <button
              type="button"
              className="flex flex-col items-center justify-center text-on-surface-variant"
              onClick={handleGoHome}
            >
              <span className="material-symbols-outlined">home</span>
              <span className="mt-1 font-label-sm text-label-sm">Trang chủ</span>
            </button>

            <button
              type="button"
              className="flex flex-col items-center justify-center rounded-full bg-secondary-container px-4 py-1 text-on-secondary-container"
              onClick={() => navigate("/branches")}
            >
              <span className="material-symbols-outlined">search</span>
              <span className="mt-1 font-label-sm text-label-sm">Tìm sân</span>
            </button>

            <button
              type="button"
              className="flex flex-col items-center justify-center text-on-surface-variant"
              onClick={() => navigate("/my-bookings")}
            >
              <span className="material-symbols-outlined">
                event_available
              </span>
              <span className="mt-1 font-label-sm text-label-sm">
                Lịch sử đặt sân
              </span>
            </button>

            <button
              type="button"
              className="flex flex-col items-center justify-center text-on-surface-variant"
            >
              <span className="material-symbols-outlined">person</span>
              <span className="mt-1 font-label-sm text-label-sm">
                Tài khoản
              </span>
            </button>
          </nav>
        </>
      )}
    </div>
  );
}

export default MainLayout;
