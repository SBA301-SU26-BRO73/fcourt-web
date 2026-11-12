import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/hooks/use-auth-context';

export interface DetailedBranchCardProps {
  id: string;
  title: string;
  address: string;
  tags: { label: string; isHighlight?: boolean }[];
  imageUrl?: string | null;
  courtTypes: string[];
}

export default function DetailedBranchCard({ id, title, address, tags, imageUrl, courtTypes }: DetailedBranchCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div
      onClick={() => navigate(`/branches/${id}`)}
      className="group cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_4px_20px_-8px_rgba(15,23,42,0.2)] transition-all duration-300 hover:-translate-y-1 hover:border-[#2e7d32]/30 hover:shadow-[0_16px_32px_-12px_rgba(46,125,50,0.35)]"
    >
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-[#dff4df] via-[#8acb8d] to-[#2e7d32]">
        {imageUrl && !imageFailed ? (
          <img src={imageUrl} alt={title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" onError={() => setImageFailed(true)} />
        ) : (
          <div className="flex h-full items-center justify-center text-white/90">
            <span className="material-symbols-outlined text-6xl drop-shadow-sm">sports_tennis</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent" />
      </div>
      <div className="flex flex-col gap-4 p-5">
        <div>
          <h3 className="text-xl font-semibold leading-tight text-slate-900">{title}</h3>
          <p className="mt-2 flex items-start gap-1.5 text-sm leading-5 text-slate-500">
            <span className="material-symbols-outlined text-[17px] text-[#2e7d32]">location_on</span>
            <span className="line-clamp-2">{address}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {tags.map((tag, idx) => (
            <span key={idx} className={`rounded-full px-3 py-1.5 font-medium ${tag.isHighlight ? "bg-[#e4f5e5] text-[#2e7d32]" : "bg-slate-100 text-slate-600"}`}>
              {tag.label}
            </span>
          ))}
          {courtTypes.map((type) => (
            <span key={type} className="rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-600">{type}</span>
          ))}
        </div>
        <div className="border-t border-slate-100 pt-1">
          <button
            type="button"
            onClick={(event) => { event.stopPropagation(); navigate(`/branches/${id}`); }}
            className="w-full rounded-xl bg-[#2e7d32] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#256b29] active:scale-[0.99]"
          >
            {user?.role === 'ADMIN' ? 'Xem chi tiết sân' : 'Đặt sân ngay'}
          </button>
        </div>
      </div>
    </div>
  );
}
