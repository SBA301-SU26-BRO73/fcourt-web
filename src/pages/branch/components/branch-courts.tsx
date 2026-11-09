import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePublicCourtSlots } from "@/hooks/use-public-branches";
import { formatLocalDate } from "@/common/utils/local-date";
import type { CourtView } from "../branch-detail.types";

interface BranchCourtsProps {
  courts: CourtView[];
  isLoading: boolean;
  branchId: number;
}

export default function BranchCourts({ courts, isLoading, branchId }: BranchCourtsProps) {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string>("Tất cả");

  const handleViewAvailability = (courtId: number) => {
    navigate(`/slot-booking?branchId=${branchId}&courtId=${courtId}`);
  };

  // Extract unique court types from the courts list
  const courtTypes = ["Tất cả", ...Array.from(new Set(courts.map(c => c.courtTypeName).filter(Boolean)))];

  const filteredCourts = selectedType === "Tất cả"
    ? courts
    : courts.filter(c => c.courtTypeName === selectedType);

  if (isLoading) {
    return (
      <section className="space-y-stack-lg animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-surface-container rounded"></div>
          <div className="flex gap-2">
            <div className="h-8 w-16 bg-surface-container rounded-full"></div>
            <div className="h-8 w-20 bg-surface-container rounded-full"></div>
          </div>
        </div>
        <div className="space-y-stack-md">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl h-44 w-full"></div>
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl h-44 w-full"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-stack-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-stack-md">
        <h2 className="font-headline-md text-headline-md text-on-surface">Danh sách sân</h2>
        <div className="flex flex-wrap gap-unit">
          {courtTypes.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-stack-md py-unit rounded-full font-label-sm text-label-sm transition-all cursor-pointer ${
                selectedType === type
                  ? "bg-primary text-on-primary"
                  : "hover:bg-surface-container text-on-surface-variant"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-stack-md">
        {filteredCourts.length === 0 ? (
          <div className="p-stack-lg text-center bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-on-surface-variant font-body-md">
            Hiện không có sân nào khả dụng.
          </div>
        ) : (
          filteredCourts.map((court) => (
            <CourtRow key={court.id} court={court} onViewAvailability={handleViewAvailability} />
          ))
        )}
      </div>
    </section>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

function CourtRow({ court, onViewAvailability }: { court: CourtView; onViewAvailability: (courtId: number) => void }) {
  const isTennis = court.courtTypeName?.toLowerCase().includes("tennis");
  const defaultSportImage = isTennis
    ? "https://lh3.googleusercontent.com/aida-public/AB6AXuCixMWLwvgosiwYViy13L4fCQ7VFkcQXOODOJU_s1mkUAlElpUHrRvspI1ApBDtkkj1Alhpzkyi_nXa2g-xSCNOSZFUB8QjowFo517vq7t3w8pt2Ei9Nmoc5ZAWzNO9A0HQYTjLV-bCQfqxtkjdqoLO_AsZx9KLZRWrGKUIYHtJj3knvtfjAv44HncnbLf-ivyJkfSPsSuOrqO_ksbUUAxG8HHMkBf7YumW3mDpUHH_bv38vIIbgNLj-RrIR0AhwjVjVxNsqU7XuzA"
    : "https://lh3.googleusercontent.com/aida-public/AB6AXuDkf1-dSdwtoABJkWeg8R_dEK6FxEDzKiL2xWYUVxhTLeiLg0TJOcxu0LTobNbkpWaPhhCFNcXwEtjckUaTiV9duWZVJnJIwqinb8kyiDyEBNy59ffqH4pY-MgnwHVwChqQi7dCGYoPV6NQ3x6jdZizWiifMKP-taxp_2DQyxSqWRj8eZ7KtIZVLqFULfyD4m_FYr18YJWSQBm3KtkEKJr7w2uKo7TLWBEy8HR9KVjjr_GTLewEHo-d6uJdI7vpUtHJuMwWKaS3m8Y";
  const [imageFailed, setImageFailed] = useState(false);
  const { data: todaySlots, isPending, isError } = usePublicCourtSlots(court.id, formatLocalDate(new Date()));
  const availableToday = (todaySlots ?? []).filter((slot) => slot.status === "AVAILABLE");
  const lowestPrice = availableToday.length > 0 ? Math.min(...availableToday.map((slot) => slot.price)) : court.defaultPricePerHour;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl overflow-hidden flex flex-col md:flex-row hover:border-primary transition-all hover:shadow-lg group">
      <div className="md:w-1/3 h-48 md:h-auto overflow-hidden bg-surface-container">
        <img alt={court.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src={court.imageUrl && !imageFailed ? court.imageUrl : defaultSportImage} onError={() => setImageFailed(true)} />
      </div>
      <div className="p-stack-lg flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start gap-4">
          <div>
            <span className="text-secondary font-label-sm text-label-sm uppercase tracking-widest">
              {court.courtTypeName || "Sân thể thao"}
            </span>
            <h3 className="font-headline-md text-headline-md mt-unit text-on-surface">{court.name}</h3>
            <div className="flex items-center gap-stack-sm mt-3">
              <span className="bg-surface-container text-on-surface-variant px-stack-sm py-xs rounded font-label-sm text-label-sm">
                {isPending ? "Đang tải lịch..." : isError ? "Không tải được lịch hôm nay" : `Hôm nay còn ${availableToday.length} khung giờ trống`}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-headline-md text-primary text-headline-md font-bold">Từ {formatCurrency(lowestPrice)}</div>
            <div className="font-label-sm text-label-sm text-on-surface-variant">theo khung giờ</div>
          </div>
        </div>
        <div className="mt-stack-lg flex gap-stack-md">
          <button
            onClick={() => onViewAvailability(court.id)}
            className="flex-1 bg-primary text-on-primary py-3 rounded-lg font-label-md text-label-md hover:scale-[1.02] transition-transform cursor-pointer"
          >
            Xem lịch trống
          </button>
        </div>
      </div>
    </div>
  );
}
