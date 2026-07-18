export default function HeroSection() {
    return (
      <section className="relative w-full min-h-[85vh] flex flex-col items-center justify-center px-margin-mobile md:px-margin-desktop overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="Modern Sports Arena"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkf1-dSdwtoABJkWeg8R_dEK6FxEDzKiL2xWYUVxhTLeiLg0TJOcxu0LTobNbkpWaPhhCFNcXwEtjckUaTiV9duWZVJnJIwqinb8kyiDyEBNy59ffqH4pY-MgnwHVwChqQi7dCGYoPV6NQ3x6jdZizWiifMKP-taxp_2DQyxSqWRj8eZ7KtIZVLqFULfyD4m_FYr18YJWSQBm3KtkEKJr7w2uKo7TLWBEy8HR9KVjjr_GTLewEHo-d6uJdI7vpUtHJuMwWKaS3m8Y"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-surface/20 via-surface/60 to-surface"></div>
        </div>
        <div className="relative z-10 max-w-4xl text-center space-y-stack-lg">
          <h1 className="font-display-lg text-display-lg md:text-[64px] tracking-tighter text-on-surface">
            Find your <span className="primary-gradient-text italic">court.</span>
            <br />
            Play your game.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            The premium sports-tech ecosystem for active professionals. Book
            high-performance venues in seconds.
          </p>
  
          {/* Search Bar */}
          <div className="mt-stack-xl glass-card border border-white/40 p-2 rounded-2xl shadow-xl flex flex-col md:flex-row items-stretch gap-2 max-w-3xl mx-auto">
            <div className="flex-1 flex items-center px-4 gap-3 border-r border-outline-variant/30">
              <span className="material-symbols-outlined text-primary">
                sports_tennis
              </span>
              <select className="bg-transparent border-none focus:ring-0 text-on-surface font-label-md w-full">
                <option>Pickleball</option>
                <option>Tennis</option>
                <option>Badminton</option>
              </select>
            </div>
            <div className="flex-1 flex items-center px-4 gap-3 border-r border-outline-variant/30">
              <span className="material-symbols-outlined text-primary">
                location_on
              </span>
              <input
                className="bg-transparent border-none focus:ring-0 text-on-surface font-label-md w-full"
                placeholder="Location"
                type="text"
              />
            </div>
            <div className="flex-1 flex items-center px-4 gap-3 border-r border-outline-variant/30">
              <span className="material-symbols-outlined text-primary">
                calendar_today
              </span>
              <input
                className="bg-transparent border-none focus:ring-0 text-on-surface font-label-md w-full"
                type="date"
              />
            </div>
            <button className="primary-gradient text-white px-8 py-4 rounded-xl font-label-md shadow-lg shadow-primary/20 hover:scale-105 transition-transform active:scale-95">
              Search
            </button>
          </div>
        </div>
      </section>
    );
  }