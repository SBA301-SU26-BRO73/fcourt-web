import { useNavigate } from "react-router-dom";

export interface DetailedBranchCardProps {
  id: string;
  title: string;
  address: string;
  tags: { label: string; isHighlight?: boolean }[];
}

export default function DetailedBranchCard({
  id,
  title,
  address,
  tags,
}: DetailedBranchCardProps) {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/branches/${id}`)}
      className="group bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer"
    >
      <div className="flex h-24 items-end bg-gradient-to-br from-primary to-primary/70 px-gutter py-4 text-white">
        <span className="material-symbols-outlined text-4xl opacity-80">sports_tennis</span>
      </div>
      <div className="flex flex-col gap-3 p-gutter">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-headline-md text-headline-md leading-tight">{title}</h3>
            <p className="text-body-sm text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              {address}
            </p>
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
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/branches/${id}`);
            }}
            className="primary-gradient rounded-xl px-6 py-2 text-label-md font-bold text-white transition-all hover:scale-105 active:scale-95"
          >
            Quick Book
          </button>
        </div>
      </div>
    </div>
  );
}
