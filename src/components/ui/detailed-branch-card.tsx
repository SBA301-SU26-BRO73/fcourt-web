import { useNavigate } from "react-router-dom";

export interface DetailedBranchCardProps {
  id: string;
  imageSrc: string;
  title: string;
  address: string;
  price: string;
  rating: string;
  distance: string;
  tags: { label: string; isHighlight?: boolean }[];
}

export default function DetailedBranchCard({
  id,
  imageSrc,
  title,
  address,
  price,
  rating,
  distance,
  tags,
}: DetailedBranchCardProps) {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/branches/${id}`)}
      className="group bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={imageSrc}
          alt={title}
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
          <span
            className="material-symbols-outlined text-secondary text-[16px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
          <span className="text-label-sm font-bold text-on-surface">{rating}</span>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            /* Xử lý logic Thêm vào yêu thích ở đây */
          }}
          className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full text-white transition-colors"
        >
          <span className="material-symbols-outlined">favorite</span>
        </button>
      </div>
      <div className="p-gutter flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-headline-md text-headline-md leading-tight">{title}</h3>
            <p className="text-body-sm text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              {address}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-headline-md font-bold text-primary">${price}</span>
            <span className="text-label-sm text-on-surface-variant">per hour</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className={`px-2 py-1 rounded-md text-label-sm ${
                tag.isHighlight
                  ? "bg-secondary-container text-on-secondary-container font-bold"
                  : "bg-surface-container text-on-surface-variant"
              }`}
            >
              {tag.label}
            </span>
          ))}
        </div>
        <div className="pt-3 border-t border-outline-variant/30 flex justify-between items-center">
          <span className="text-label-sm text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">distance</span>
            {distance}
          </span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/branches/${id}`);
            }}
            className="primary-gradient text-white px-6 py-2 rounded-xl text-label-md font-bold hover:scale-105 active:scale-95 transition-all"
          >
            Quick Book
          </button>
        </div>
      </div>
    </div>
  );
}