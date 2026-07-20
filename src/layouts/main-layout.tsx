import { Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useState, type FormEvent } from "react";
import type { BranchFilterRequest } from "@/services/branch/branch.api";
import { useAuth } from "@/hooks/use-auth-context";

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const { user, isLoggedIn } = useAuth();

  const [searchInput, setSearchInput] = useState("");
  const [globalFilters, setGlobalFilters] =
    useState<BranchFilterRequest>({});

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newFilters: BranchFilterRequest = {};

    if (searchInput.trim()) {
      newFilters.keyword = searchInput.trim();
    }

    setGlobalFilters(newFilters);
    const nextParams = new URLSearchParams(urlSearchParams);
    ["keyword", "name", "city", "address", "ward"].forEach((key) => nextParams.delete(key));
    if (searchInput.trim()) nextParams.set("keyword", searchInput.trim());
    nextParams.delete("page");
    if (location.pathname !== "/branches") {
      navigate(`/branches?${nextParams.toString()}`);
    } else {
      setUrlSearchParams(nextParams);
    }
  };

  const handleGoHome = () => {
    setSearchInput("");
    setGlobalFilters({});
    setUrlSearchParams({});
    navigate("/");
  };

  const handleAccountClick = () => {
    navigate(isLoggedIn ? "/profile" : "/auth/login?role=customer");
  };

  const accountLabel = isLoggedIn ? (user?.email || "Tài khoản") : "Đăng nhập";

  const isHomePage = location.pathname === "/";

  const isBranchListPage =
    location.pathname === "/branches" ||
    location.pathname === "/branches/";

  const isManagementPage =
    location.pathname.startsWith("/auth/branches") ||
    location.pathname.startsWith("/auth/courts") ||
    location.pathname.startsWith("/auth/time-slots");

  return (
    <div className="bg-background text-on-surface font-body-md selection:bg-primary/20 selection:text-primary min-h-screen flex flex-col">
      {!isManagementPage &&
        (isBranchListPage ? (
          <header className="fixed left-0 top-0 z-50 flex w-full flex-col items-stretch justify-between gap-2 border-b border-outline-variant/30 px-margin-mobile py-3 shadow-md glass-nav md:flex-row md:items-center md:gap-0 md:px-margin-desktop md:py-4">
            <div className="flex w-full items-center justify-between md:w-auto">
              <button
                type="button"
                className="flex cursor-pointer items-center gap-4"
                onClick={handleGoHome}
              >
                <span className="text-headline-md font-bold tracking-tight text-primary">
                  FCourt
                </span>
              </button>

              <div className="flex items-center gap-2 md:hidden">
                <button
                  type="button"
                  aria-label={accountLabel}
                  onClick={handleAccountClick}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-2 text-primary transition-colors hover:bg-primary/10"
                >
                  <span className="material-symbols-outlined text-[22px]">
                    account_circle
                  </span>
                  <span className="hidden text-xs font-semibold sm:inline">{isLoggedIn ? "Tài khoản" : "Đăng nhập"}</span>
                </button>
              </div>
            </div>

            <div className="flex w-full max-w-xl flex-1 gap-2 md:mx-gutter">
              <form
                onSubmit={handleSearch}
                className="relative flex flex-1 items-center overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low pr-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
              >
                <button
                  type="submit"
                  aria-label="Search"
                  className="flex items-center justify-center py-2 pl-3 pr-1 text-on-surface-variant transition-colors hover:text-primary focus:outline-none"
                >
                  <span className="material-symbols-outlined">search</span>
                </button>

                <input
                  className="w-full border-none bg-transparent py-2 pl-2 pr-2 text-body-sm outline-none focus:outline-none focus:ring-0"
                  placeholder="Tìm sân, thành phố, quận, phường..."
                  type="text"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />
              </form>

            </div>

            <div className="hidden items-center md:flex">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  aria-label={accountLabel}
                  onClick={handleAccountClick}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-2 text-primary transition-colors hover:bg-primary/10"
                >
                  <span className="material-symbols-outlined text-[22px]">
                    account_circle
                  </span>
                  <span className="hidden text-sm font-semibold lg:inline">{isLoggedIn ? "Tài khoản" : "Đăng nhập"}</span>
                </button>
              </div>
            </div>
          </header>
        ) : (
          <header className="fixed top-0 left-0 w-full z-50 bg-white/90 dark:bg-[#1a1b1f]/90 backdrop-blur-md border-b border-outline-variant/30 flex justify-between items-center px-4 md:px-16 h-16 transition-all duration-300 shadow-sm">
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleGoHome}>
              <span className="material-symbols-outlined text-[#006d38] dark:text-[#59df89] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
              <span className="font-extrabold text-xl tracking-tight text-[#006d38] dark:text-[#59df89]">
                FCourt
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <button onClick={handleGoHome} className="font-bold text-sm text-[#006d38] dark:text-[#59df89] active-scale">
                Trang chủ
              </button>
              <button onClick={() => navigate('/branches')} className="font-bold text-sm text-gray-700 dark:text-gray-300 hover:text-[#006d38] dark:hover:text-[#59df89] transition-colors">
                Tìm sân
              </button>
              <a href="#features" className="font-bold text-sm text-gray-700 dark:text-gray-300 hover:text-[#006d38] dark:hover:text-[#59df89] transition-colors">
                Về chúng tôi
              </a>
              <button
                type="button"
                onClick={handleAccountClick}
                className="bg-[#006d38] hover:bg-[#00a859] active:scale-95 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">account_circle</span>
                <span>{isLoggedIn ? (user?.email?.split('@')[0] || "Tài khoản") : "Đăng nhập"}</span>
              </button>
            </div>

            <div className="md:hidden flex items-center gap-2">
              <button
                type="button"
                onClick={handleAccountClick}
                className="bg-[#006d38] active:scale-95 text-white px-4 py-1.5 rounded-xl font-bold text-xs shadow-sm flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-base">account_circle</span>
                <span>{isLoggedIn ? "Tài khoản" : "Đăng nhập"}</span>
              </button>
            </div>
          </header>
        ))}

      <main
        className={`flex-1 ${
          isManagementPage
            ? ""
            : isBranchListPage
              ? "pt-32 md:pt-24"
              : isHomePage
                ? "pt-16"
                : "pt-24"
        }`}
      >
        <Outlet context={{ globalFilters, setGlobalFilters }} />
      </main>

      {!isManagementPage && (
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
              <span className="mt-1 font-label-sm text-label-sm">Home</span>
            </button>

            <button
              type="button"
              className="flex flex-col items-center justify-center rounded-full bg-secondary-container px-4 py-1 text-on-secondary-container"
              onClick={() => navigate("/branches")}
            >
              <span className="material-symbols-outlined">search</span>
              <span className="mt-1 font-label-sm text-label-sm">Search</span>
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
                Bookings
              </span>
            </button>

            <button
              type="button"
              className="flex flex-col items-center justify-center text-on-surface-variant"
            >
              <span className="material-symbols-outlined">person</span>
              <span className="mt-1 font-label-sm text-label-sm">
                Profile
              </span>
            </button>
          </nav>
        </>
      )}
    </div>
  );
}

export default MainLayout;
