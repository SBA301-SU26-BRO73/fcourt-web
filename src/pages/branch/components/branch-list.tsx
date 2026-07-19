import { useState, useEffect } from "react";
import { useSearchParams, useOutletContext } from "react-router-dom";
import DetailedBranchCard from "../../../components/ui/detailed-branch-card";
import SkeletonCard from "../../../components/ui/skeleton-card";
import { branchApi, type Branch, type BranchFilterRequest } from "../../../services/branch/branch.api";

export default function BranchList() {
  const { globalFilters } = useOutletContext<{ globalFilters: BranchFilterRequest }>(); 
  
  const [searchParams] = useSearchParams();
  const courtTypeName = searchParams.get("courtTypeName");
  const sidebarCity = searchParams.get("city");
  const sidebarWard = searchParams.get("ward");
  const sidebarAddress = searchParams.get("address");
  const sidebarStatus = searchParams.get("status");
  const urlName = searchParams.get("name");
  const urlCity = searchParams.get("city");
  const urlWard = searchParams.get("ward");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  
  const [currentPage, setCurrentPage] = useState<number>(0); 
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const pageSize = 6; 

  useEffect(() => {
    setCurrentPage(0);
  }, [globalFilters, courtTypeName, sidebarCity, sidebarWard, sidebarAddress, sidebarStatus]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setIsLoading(true);
        let data;
        
        const combinedFilters: BranchFilterRequest = { 
          ...globalFilters, 
          courtTypeName: courtTypeName || undefined,
          name: urlName || globalFilters.name || undefined,
          city: sidebarCity || urlCity || globalFilters.city || undefined,
          ward: sidebarWard || urlWard || globalFilters.ward || undefined,
          address: sidebarAddress || globalFilters.address || undefined,
          status: sidebarStatus || globalFilters.status || undefined
        };
        
        const hasFilter = Object.values(combinedFilters).some(value => value !== undefined);

        if (hasFilter) {
          data = await branchApi.search(combinedFilters, currentPage, pageSize);
        } else {
          data = await branchApi.getAll(currentPage, pageSize);
        }
        
        setBranches(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } catch (error) {
        console.error("Lỗi khi tải danh sách Branch:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBranches();
  }, [currentPage, globalFilters, courtTypeName, sidebarCity, sidebarWard, sidebarAddress, sidebarStatus, urlName, urlCity, urlWard]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
    }
  };

  const renderPaginationButtons = () => {
    const pages = [];
    for (let i = 0; i < totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-colors ${
            currentPage === i
              ? "bg-primary text-white font-bold border-primary shadow-md"
              : "border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          {i + 1}
        </button>
      );
    }
    return pages;
  };

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
        {isLoading ? (
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

      {!isLoading && totalPages > 1 && (
        <div className="mt-stack-xl flex justify-center items-center gap-2">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          
          {renderPaginationButtons()}

          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      )}
    </section>
  );
}
