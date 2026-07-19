import { useState, useEffect, useRef } from "react";
import { useSearchParams, useOutletContext } from "react-router-dom";
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

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  
  const [currentPage, setCurrentPage] = useState<number>(0); 
  const [totalElements, setTotalElements] = useState<number>(0);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 6; 
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    setCurrentPage(0);
    setBranches([]);
    setHasMore(true);
  }, [globalFilters, courtTypeName, sidebarCity, sidebarWard, sidebarAddress, sidebarStatus, selectedDistrict, urlKeyword]);

  useEffect(() => {
    const fetchBranches = async () => {
      if (isFetchingRef.current) return;

      isFetchingRef.current = true;
      try {
        setIsLoading(true);
        let data;
        
        const combinedFilters: BranchFilterRequest = { 
          ...globalFilters, 
          courtTypeName: courtTypeName || undefined,
          keyword: urlKeyword || globalFilters.keyword || undefined,
          name: urlName || globalFilters.name || undefined,
          city: sidebarCity || urlCity || globalFilters.city || undefined,
          ward: sidebarWard || urlWard || globalFilters.ward || undefined,
          address: sidebarAddress || globalFilters.address || undefined,
          status: sidebarStatus || globalFilters.status || undefined
        };
        
        const hasFilter = Object.values(combinedFilters).some((value) =>
          typeof value === "string" ? value.trim().length > 0 : value !== undefined,
        );

        const districtWards = selectedDistrict
          ? findLocationDistrict(sidebarCity ?? "", selectedDistrict)?.wards.map((item) => item.name) ?? []
          : [];
        const requestSize = selectedDistrict && !sidebarWard ? 100 : pageSize;

        if (hasFilter) {
          data = await branchApi.search(combinedFilters, currentPage, requestSize);
        } else {
          data = await branchApi.getAll(currentPage, requestSize);
        }

        const content = selectedDistrict && !sidebarWard
          ? data.content.filter((branch) => districtWards.includes(branch.ward ?? ""))
          : data.content;
        setBranches((current) => currentPage === 0
          ? content
          : [...current, ...content.filter((branch) => !current.some((item) => item.id === branch.id))]);
        setTotalElements(data.totalElements);
        setHasMore(
          data.content.length > 0 &&
            currentPage + 1 < data.totalPages,
        );
      } catch (error) {
        console.error("Lỗi khi tải danh sách Branch:", error);
      } finally {
        isFetchingRef.current = false;
        setIsLoading(false);
      }
    };

    fetchBranches();
  }, [currentPage, globalFilters, courtTypeName, sidebarCity, sidebarWard, sidebarAddress, sidebarStatus, selectedDistrict, urlKeyword, urlName, urlCity, urlWard]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoading) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !isFetchingRef.current) {
        setCurrentPage((page) => page + 1);
      }
    }, { rootMargin: "320px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading]);

  return (
    <section className="flex-1 pb-24">
      <div className="flex justify-between items-end mb-stack-lg">
        <div className="flex flex-col gap-1">
          <h1 className="font-headline-lg text-headline-lg">Tìm sân gần bạn</h1>
          <p className="text-body-md text-on-surface-variant">
            Showing {totalElements} locations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
        {isLoading && branches.length === 0 ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : branches.length > 0 ? (
          branches.map((branch) => (
            <DetailedBranchCard 
              key={branch.id} 
              id={branch.id.toString()}
              title={branch.name}
              address={[branch.address, branch.ward, branch.city].filter(Boolean).join(", ")}
              tags={[
                { 
                  label: branch.status === "ACTIVE" ? "Open" : "Closed", 
                  isHighlight: branch.status === "ACTIVE" 
                },
                { 
                  label: `${branch.openTime ? branch.openTime.slice(0, 5) : '00:00'} - ${branch.closeTime ? branch.closeTime.slice(0, 5) : '00:00'}` 
                }
              ]}
            />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-on-surface-variant font-body-lg">
            Không tìm thấy cơ sở nào phù hợp với bộ lọc hiện tại.
          </div>
        )}
      </div>

      <div ref={sentinelRef} className="mt-stack-xl flex min-h-10 items-center justify-center text-sm text-on-surface-variant">
        {isLoading && branches.length > 0 && "Đang tải thêm sân..."}
        {!isLoading && !hasMore && branches.length > 0 && "Đã hiển thị hết sân phù hợp."}
      </div>
    </section>
  );
}
