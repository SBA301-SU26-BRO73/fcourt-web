export default function PromoBannerSection() {
    return (
      <section className="py-stack-xl px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="primary-gradient rounded-[32px] p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-gutter shadow-2xl">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[200px]">loyalty</span>
          </div>
          <div className="relative z-10 max-w-lg text-center md:text-left">
            <h2 className="font-display-lg text-white mb-stack-sm">
              Join the Velocity Club
            </h2>
            <p className="font-body-lg text-white/80">
              Get <span className="font-bold text-secondary-container">20% off</span>{" "}
              your first 5 bookings and unlock early access to new venues.
            </p>
          </div>
          <div className="relative z-10 flex flex-col gap-4 w-full md:w-auto">
            <button className="bg-white text-primary px-10 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 transition-transform">
              Get Started
            </button>
            <p className="text-white/60 text-center font-label-sm">
              Terms and conditions apply.
            </p>
          </div>
        </div>
      </section>
    );
  }