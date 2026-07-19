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
          <header
            className={`fixed left-0 top-0 z-50 w-full border-b border-outline-variant/30 backdrop-blur-md ${
              isHomePage
                ? "bg-surface/80 shadow-sm"
                : "glass-nav shadow-md"
            }`}
          >
            <div
              className={`mx-auto flex w-full items-center justify-between px-margin-mobile py-4 md:px-margin-desktop ${
                isHomePage ? "max-w-container-max" : "max-w-[1440px]"
              }`}
            >
              <button
                type="button"
                className="flex cursor-pointer items-center gap-stack-md"
                onClick={handleGoHome}
              >
                <span className="text-headline-md font-bold tracking-tight text-primary">
                  FCourt
                </span>
              </button>

              <div className="flex items-center gap-stack-md">
                <button
                  type="button"
                  aria-label={accountLabel}
                  onClick={handleAccountClick}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-2 text-primary transition-all hover:bg-primary/10 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[22px]">
                    account_circle
                  </span>
                  <span className="hidden text-xs font-semibold sm:inline">{isLoggedIn ? "Tài khoản" : "Đăng nhập"}</span>
                </button>
              </div>
            </div>
          </header>
        ))}

      <main
        className={`flex-1 ${
          isManagementPage
            ? ""
            : isBranchListPage
              ? "pt-32 md:pt-24"
              : "pt-24"
        }`}
      >
        <Outlet context={{ globalFilters, setGlobalFilters }} />
      </main>

      {!isManagementPage && (
        <>
          <footer className="w-full border-t border-outline-variant bg-surface-container-highest px-margin-mobile pb-margin-mobile pt-stack-xl md:px-margin-desktop">
            <div className="mx-auto mb-stack-xl flex max-w-container-max flex-col justify-between gap-gutter md:flex-row">
              <div className="max-w-xs space-y-4">
                <div className="flex items-center gap-2">
                  <span className="font-headline-md font-bold text-on-surface">
                    FCourt
                  </span>
                </div>

                <p className="font-body-sm font-label-md text-on-surface-variant">
                  The world's most advanced booking engine for performance
                  sports venues.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-stack-lg sm:grid-cols-3">
                <div className="flex flex-col gap-3">
                  <a
                    className="font-label-md text-on-surface-variant transition-colors hover:text-primary"
                    href="#"
                  >
                    About FCourt
                  </a>

                  <a
                    className="font-label-md text-on-surface-variant transition-colors hover:text-primary"
                    href="#"
                  >
                    Terms of Service
                  </a>
                </div>

                <div className="flex flex-col gap-3">
                  <a
                    className="font-label-md text-on-surface-variant transition-colors hover:text-primary"
                    href="#"
                  >
                    Privacy Policy
                  </a>

                  <a
                    className="font-label-md text-on-surface-variant transition-colors hover:text-primary"
                    href="#"
                  >
                    Help Center
                  </a>
                </div>

                <div className="flex flex-col gap-3">
                  <a
                    className="font-label-md text-on-surface-variant transition-colors hover:text-primary"
                    href="#"
                  >
                    Partner With Us
                  </a>
                </div>
              </div>
            </div>

            <div className="mx-auto max-w-container-max border-t border-outline-variant/30 pt-stack-md">
              <p className="text-center font-label-sm text-on-surface-variant opacity-80 md:text-left">
                © 2024 FCourt. All rights reserved.
              </p>
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

      {!isManagementPage && isHomePage && (
        <div className="fixed bottom-24 right-4 z-40 flex lg:bottom-stack-lg lg:right-stack-lg">
          <button
            type="button"
            onClick={() => navigate("/branches")}
            className="primary-gradient group flex items-center justify-center rounded-full p-4 text-white shadow-2xl transition-all hover:scale-105 lg:px-8 lg:py-4"
          >
            <span className="material-symbols-outlined text-[28px] transition-transform group-hover:rotate-12 lg:text-[24px]">
              bolt
            </span>

            <span className="ml-3 hidden font-label-md font-bold lg:block">
              Quick Book Now
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

export default MainLayout;
