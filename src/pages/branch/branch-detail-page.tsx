import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { branchApi, type Branch, type CourtResponse } from "../../services/branch/branch.api";

import BranchGallery from "./components/branch-gallery";
import BranchInfo from "./components/branch-info";
import BranchCourts from "./components/branch-courts";
import BranchReviews from "./components/branch-reviews";
import BookingPanel from "./components/booking-panel";
import { getApiErrorMessage } from "@/common/utils/api-error";

export default function BranchDetailPage() {
  const { id } = useParams<{ id: string }>(); 
  const [branch, setBranch] = useState<Branch | null>(null);
  const [courts, setCourts] = useState<CourtResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingCourts, setIsLoadingCourts] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranchDetail = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        setIsLoadingCourts(true);
        setLoadError(null);
        const data = await branchApi.getById(id);
        setBranch(data);
        
        const courtsData = await branchApi.getCourtsByBranch(id);
        setCourts(courtsData);
      } catch (error) {
        setBranch(null);
        setCourts([]);
        setLoadError(getApiErrorMessage(error, "Không thể tải thông tin cơ sở."));
      } finally {
        setIsLoading(false);
        setIsLoadingCourts(false);
      }
    };

    fetchBranchDetail();
  }, [id]);

  // Loading Skeleton cho toàn trang Detail
  if (isLoading) {
    return (
      <div className="pt-8 w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 flex justify-center py-24">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!branch) {
    return <div role="alert" className="px-4 py-24 text-center text-headline-md text-red-700">{loadError ?? 'Không tìm thấy cơ sở này.'}</div>;
  }

  return (
    <div className="pb-stack-xl pt-8 w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 lg:grid lg:grid-cols-12 lg:gap-gutter">
      
      <div className="lg:col-span-8 space-y-stack-xl">
        <header className="space-y-stack-sm">
          <nav className="flex items-center gap-unit text-on-surface-variant font-label-sm text-label-sm">
            <Link to="/branches" className="hover:text-primary">Địa điểm</Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="hover:text-primary cursor-pointer">{branch.city}</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-on-surface">{branch.name}</span>
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-stack-md">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface">{branch.name}</h1>
              <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-unit mt-unit">
                <span className="material-symbols-outlined text-primary text-lg">location_on</span>
                {[branch.address, branch.ward, branch.city].filter(Boolean).join(', ')}
              </p>
            </div>
            <div className="flex items-center gap-stack-sm">
              {branch.status === "ACTIVE" && (
                 <span className="bg-secondary-container text-on-secondary-container px-stack-md py-unit rounded-full font-label-sm text-label-sm flex items-center gap-unit">
                   <span className="w-2 h-2 rounded-full bg-secondary"></span> Đang mở cửa
                 </span>
              )}
              <div className="flex items-center gap-unit text-on-surface">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="font-label-md text-label-md">4.9 (124 đánh giá)</span>
              </div>
            </div>
          </div>
        </header>

        {/* Các component con có thể được pass prop branch vào sau này nếu cần */}
        <BranchGallery />
        <BranchInfo branch={branch} courts={courts} />
        <BranchCourts courts={courts} isLoading={isLoadingCourts} branchId={branch.id} />
        <BranchReviews />
        
      </div>

      {/* Cột phải (4) */}
      <BookingPanel branch={branch} courts={courts} />

    </div>
  );
}
