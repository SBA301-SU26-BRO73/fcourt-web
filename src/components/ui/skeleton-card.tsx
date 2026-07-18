export default function SkeletonCard() {
    return (
      <div className="group bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden hover:shadow-lg opacity-90 transition-all duration-300">
        <div className="relative h-48 bg-surface-container-highest animate-pulse"></div>
        <div className="p-gutter flex flex-col gap-3">
          <div className="h-6 w-3/4 bg-surface-container-high rounded-full animate-pulse"></div>
          <div className="h-4 w-1/2 bg-surface-container-high rounded-full animate-pulse"></div>
          <div className="h-10 w-full bg-surface-container-high rounded-xl mt-4 animate-pulse"></div>
        </div>
      </div>
    );
  }