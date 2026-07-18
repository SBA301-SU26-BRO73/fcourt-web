import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import type { BranchFilterRequest } from "@/services/branch/branch.api";

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchInput, setSearchInput] = useState("");
  const [searchType, setSearchType] =
    useState<keyof BranchFilterRequest>("name");
  const [globalFilters, setGlobalFilters] =
    useState<BranchFilterRequest>({});

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newFilters: BranchFilterRequest = {};

    if (searchInput.trim()) {
      newFilters[searchType] = searchInput.trim();
    }

    setGlobalFilters(newFilters);

    if (location.pathname !== "/branches") {
      navigate("/branches");
    }
  };

  const handleGoHome = () => {
    setSearchInput("");
    setGlobalFilters({});
    navigate("/");
  };

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
                  Velocity
                </span>
              </button>

              <div className="flex items-center gap-2 md:hidden">
                <button
                  type="button"
                  aria-label="Notifications"
                  className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high/50"
                >
                  <span className="material-symbols-outlined">
                    notifications
                  </span>
                </button>

                <button
                  type="button"
                  aria-label="Account"
                  className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high/50"
                >
                  <span className="material-symbols-outlined">
                    account_circle
                  </span>
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
                  placeholder={`Search by ${searchType}...`}
                  type="text"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />

                <select
                  value={searchType}
                  onChange={(event) =>
                    setSearchType(
                      event.target.value as keyof BranchFilterRequest,
                    )
                  }
                  className="cursor-pointer rounded-lg border-none bg-surface-container-high px-2 py-1 text-label-sm font-bold text-on-surface outline-none focus:ring-0"
                >
                  <option value="name">Name</option>
                  <option value="city">City</option>
                  <option value="address">Address</option>
                  <option value="ward">Ward</option>
                </select>
              </form>

              <div className="hidden shrink-0 rounded-xl bg-surface-container-high p-1 sm:flex">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg bg-surface-container-lowest px-4 py-1.5 text-label-md font-bold text-primary shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    format_list_bulleted
                  </span>
                  List
                </button>

                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg px-4 py-1.5 text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-highest"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    map
                  </span>
                  Map
                </button>
              </div>
            </div>

            <div className="hidden items-center gap-gutter md:flex">
              <nav className="hidden items-center gap-stack-lg xl:flex">
                <a
                  className="border-b-2 border-primary pb-1 font-label-md text-primary"
                  href="#"
                >
                  All Courts
                </a>

                <a
                  className="font-label-md text-on-surface-variant transition-colors hover:text-on-surface"
                  href="#"
                >
                  Pickleball
                </a>

                <a
                  className="font-label-md text-on-surface-variant transition-colors hover:text-on-surface"
                  href="#"
                >
                  Tennis
                </a>
              </nav>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  aria-label="Notifications"
                  className="rounded-full p-2 transition-colors hover:bg-surface-container-high"
                >
                  <span className="material-symbols-outlined text-on-surface-variant">
                    notifications
                  </span>
                </button>

                <button
                  type="button"
                  aria-label="Account"
                  className="rounded-full p-2 transition-colors hover:bg-surface-container-high"
                >
                  <span className="material-symbols-outlined text-on-surface-variant">
                    account_circle
                  </span>
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
                  Velocity
                </span>
              </button>

              <nav className="hidden items-center gap-gutter md:flex">
                <a
                  className="font-label-md text-label-md text-on-surface-variant transition-colors hover:text-on-surface"
                  href="#"
                >
                  Pickleball
                </a>

                <a
                  className="border-b-2 border-primary pb-1 font-label-md text-label-md text-primary"
                  href="#"
                >
                  Tennis
                </a>

                <a
                  className="font-label-md text-label-md text-on-surface-variant transition-colors hover:text-on-surface"
                  href="#"
                >
                  Badminton
                </a>
              </nav>

              <div className="flex items-center gap-stack-md">
                <button
                  type="button"
                  aria-label="Notifications"
                  className="rounded-lg p-2 text-on-surface-variant transition-all hover:bg-surface-container-high/50 active:scale-95"
                >
                  <span className="material-symbols-outlined">
                    notifications
                  </span>
                </button>

                <button
                  type="button"
                  aria-label="Account"
                  className="rounded-lg p-2 text-on-surface-variant transition-all hover:bg-surface-container-high/50 active:scale-95"
                >
                  <span className="material-symbols-outlined">
                    account_circle
                  </span>
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
                    Velocity Sports
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
                    About Velocity
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
                © 2024 Velocity Sports. All rights reserved.
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