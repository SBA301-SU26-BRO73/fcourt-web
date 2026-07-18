export interface CourtCardProps {
    imageSrc: string;
    title: string;
    rating: string;
    location: string;
    price: string;
    isAvailableNow?: boolean;
  }
  
  export default function CourtCard({
    imageSrc,
    title,
    rating,
    location,
    price,
    isAvailableNow,
  }: CourtCardProps) {
    return (
      <div className="w-[85vw] md:w-[300px] lg:w-[calc(25%-18px)] shrink-0 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
        <div className="relative h-48">
          <img
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            src={imageSrc}
            alt={title}
          />
          {isAvailableNow && (
            <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Available Now
            </span>
          )}
        </div>
        <div className="p-stack-md space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-headline-md text-headline-md text-on-surface">
              {title}
            </h3>
            <div className="flex items-center gap-1 text-primary">
              <span
                className="material-symbols-outlined text-[16px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              <span className="font-label-sm">{rating}</span>
            </div>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">
              location_on
            </span>{" "}
            {location}
          </p>
          <div className="pt-4 border-t border-outline-variant/20 flex justify-between items-center">
            <span className="font-headline-md text-primary">
              ${price}
              <span className="text-label-sm text-on-surface-variant font-normal">
                /hr
              </span>
            </span>
            <button className="text-primary font-label-md hover:underline">
              Details
            </button>
          </div>
        </div>
      </div>
    );
  }