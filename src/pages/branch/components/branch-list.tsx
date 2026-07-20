import { useEffect, useRef, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import DetailedBranchCard from "../../../components/ui/detailed-branch-card";
import SkeletonCard from "../../../components/ui/skeleton-card";
import { branchApi, type Branch, type BranchFilterRequest } from "../../../services/branch/branch.api";
import { findLocationDistrict } from "@/data/sample-locations";

export default function BranchList() {
  const { globalFilters } = useOutletContext<{ globalFilters: BranchFilterRequest }>();
  const [searchParams] = useSearchParams();
  const courtTypeName = searchParams.get("courtTypeName");
  const sidebarCity = searchParams.get("city");
  const sidebarWard = searchParams.get("ward");
  const sidebarAddress = searchParams.get("address");
  const sidebarStatus = searchParams.get("status");
  const selectedDistrict = searchParams.get("district");
  const urlKeyword = searchParams.get("keyword");
  const urlName = searchParams.get("name");
  const urlCity = searchParams.get("city");
  const urlWard = searchParams.get("ward");
  const [isLoading, setIsLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 6;
  const isFetchingRef = useRef(false);

  useEffect(() => { setCurrentPage(0); setBranches([]); }, [globalFilters, courtTypeName, sidebarCity, sidebarWard, sidebarAddress, sidebarStatus, selectedDistrict, urlKeyword, urlName, urlCity, urlWard]);

  useEffect(() => {
    const fetchBranches = async () => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      try {
        setIsLoading(true);
        const combinedFilters: BranchFilterRequest = {
          ...globalFilters,
          courtTypeName: courtTypeName || undefined,
          keyword: urlKeyword || globalFilters.keyword || undefined,
          name: urlName || globalFilters.name || undefined,
          city: sidebarCity || urlCity || globalFilters.city || undefined,
          ward: sidebarWard || urlWard || globalFilters.ward || undefined,
          address: sidebarAddress || globalFilters.address || undefined,
          status: sidebarStatus || globalFilters.status || undefined,
        };
        const hasFilter = Object.values(combinedFilters).some((value) => typeof value === "string" ? value.trim().length > 0 : value !== undefined);
        const districtWards = selectedDistrict ? findLocationDistrict(sidebarCity ?? "", selectedDistrict)?.wards.map((item) => item.name) ?? [] : [];
        const requestSize = selectedDistrict && !sidebarWard ? 100 : pageSize;
        const data = hasFilter ? await branchApi.search(combinedFilters, currentPage, requestSize) : await branchApi.getAll(currentPage, requestSize);
        const content = selectedDistrict && !sidebarWard ? data.content.filter((branch) => districtWards.includes(branch.ward ?? "")) : data.content;
        setBranches(content);
        setTotalElements(data.totalElements);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Lỗi khi tải danh sách Branch:", error);
      } finally {
        isFetchingRef.current = false;
        setIsLoading(false);
      }
    };
    fetchBranches();
  }, [currentPage, globalFilters, courtTypeName, sidebarCity, sidebarWard, sidebarAddress, sidebarStatus, selectedDistrict, urlKeyword, urlName, urlCity, urlWard]);

  return (
    <section className="flex-1 pb-24">
      <div className="mb-8 flex items-end justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Tìm sân gần bạn</h1>
          <p className="text-sm text-slate-500">Hiển thị {totalElements} cơ sở phù hợp</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {isLoading && branches.length === 0 ? Array.from({ length: 6 }, (_, index) => <SkeletonCard key={index} />) : branches.length > 0 ? branches.map((branch) => (
          <DetailedBranchCard
            key={branch.id}
            id={branch.id.toString()}
            title={branch.name}
            address={[branch.address, branch.ward, branch.city].filter(Boolean).join(", ")}
            imageUrl={branch.sampleImageUrl}
            courtTypes={branch.courtTypeNames ?? []}
            tags={[
              { label: branch.status === "ACTIVE" ? "Đang mở cửa" : "Đã đóng cửa", isHighlight: branch.status === "ACTIVE" },
              { label: `${branch.openTime ? branch.openTime.slice(0, 5) : "00:00"} - ${branch.closeTime ? branch.closeTime.slice(0, 5) : "00:00"}` },
            ]}
          />
        )) : <div className="col-span-full py-12 text-center text-slate-500">Không tìm thấy cơ sở nào phù hợp với bộ lọc hiện tại.</div>}
      </div>
      {totalPages > 1 && (
        <nav aria-label="Phân trang danh sách sân" className="mt-12 flex items-center justify-center gap-2">
          <button type="button" aria-label="Trang trước" disabled={currentPage === 0 || isLoading} onClick={() => setCurrentPage((page) => Math.max(0, page - 1))} className="grid size-10 place-items-center rounded-full border border-slate-200 text-[#2e7d32] hover:bg-[#eaf6ea] disabled:cursor-not-allowed disabled:opacity-40"><span className="material-symbols-outlined text-lg">chevron_left</span></button>
          {Array.from({ length: totalPages }, (_, page) => <button type="button" key={page} aria-label={`Trang ${page + 1}`} aria-current={page === currentPage ? "page" : undefined} onClick={() => setCurrentPage(page)} className={`grid size-10 place-items-center rounded-full text-sm font-semibold ${page === currentPage ? "bg-[#2e7d32] text-white" : "text-[#2e7d32] hover:bg-[#eaf6ea]"}`}>{page + 1}</button>)}
          <button type="button" aria-label="Trang sau" disabled={currentPage >= totalPages - 1 || isLoading} onClick={() => setCurrentPage((page) => Math.min(totalPages - 1, page + 1))} className="grid size-10 place-items-center rounded-full border border-slate-200 text-[#2e7d32] hover:bg-[#eaf6ea] disabled:cursor-not-allowed disabled:opacity-40"><span className="material-symbols-outlined text-lg">chevron_right</span></button>
        </nav>
      )}
    </section>
  );
}
