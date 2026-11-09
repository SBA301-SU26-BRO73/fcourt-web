import { useSearchParams } from "react-router-dom";
import DetailedBranchCard from "../../../components/ui/detailed-branch-card";
import SkeletonCard from "../../../components/ui/skeleton-card";
import { usePublicBranchSearch } from "@/hooks/use-public-branches";
import { useCourtTypes } from "@/hooks/use-court-types";
import { getApiErrorMessage } from "@/common/utils/api-error";
import { formatHour, formatPriceRange, paramsFromUrl } from "../branch-search.utils";

export default function BranchList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = paramsFromUrl(searchParams);
  const currentPage = params.page ?? 0;
  const { data, isPending, isFetching, error } = usePublicBranchSearch(params);
  const courtTypeNames = new Map((useCourtTypes().data?.content ?? []).map((type) => [type.id, type.name]));
  const branches = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const loadError = error ? getApiErrorMessage(error, "Không thể tải danh sách cơ sở.") : null;

  const goToPage = (page: number) => {
    const next = new URLSearchParams(searchParams);
    if (page > 0) next.set("page", String(page)); else next.delete("page");
    setSearchParams(next);
  };

  return (
    <section className="flex-1 pb-24">
      <div className="mb-8 flex items-end justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Tìm sân gần bạn</h1>
          <p className="text-sm text-slate-500">Hiển thị {totalElements} cơ sở phù hợp</p>
        </div>
      </div>
      {loadError && (
        <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {isPending ? Array.from({ length: 6 }, (_, index) => <SkeletonCard key={index} />) : branches.length > 0 ? branches.map((branch) => {
          const price = formatPriceRange(branch.minPrice, branch.maxPrice);
          const tags = [
            { label: `${branch.courtCount} sân`, isHighlight: branch.courtCount > 0 },
            ...(branch.openTime && branch.closeTime ? [{ label: `${formatHour(branch.openTime)} - ${formatHour(branch.closeTime)}` }] : []),
            ...(branch.reviewCount > 0 ? [{ label: `${branch.averageRating.toFixed(1)} ★ (${branch.reviewCount})` }] : []),
            ...(price ? [{ label: price }] : []),
            ...(branch.distanceKm != null ? [{ label: `${branch.distanceKm.toFixed(1)} km` }] : []),
          ];
          return (
            <DetailedBranchCard
              key={branch.id}
              id={branch.id.toString()}
              title={branch.name}
              address={[branch.address, branch.district, branch.city].filter(Boolean).join(", ")}
              imageUrl={branch.imageUrl ?? null}
              courtTypes={(branch.courtTypeIds ?? []).map((typeId) => courtTypeNames.get(typeId)).filter((name): name is string => Boolean(name))}
              tags={tags}
            />
          );
        }) : !loadError && <div className="col-span-full py-12 text-center text-slate-500">Không tìm thấy cơ sở nào phù hợp với bộ lọc hiện tại.</div>}
      </div>
      {totalPages > 1 && (
        <nav aria-label="Phân trang danh sách sân" className="mt-12 flex items-center justify-center gap-2">
          <button type="button" aria-label="Trang trước" disabled={currentPage === 0 || isFetching} onClick={() => goToPage(Math.max(0, currentPage - 1))} className="grid size-10 place-items-center rounded-full border border-slate-200 text-[#2e7d32] hover:bg-[#eaf6ea] disabled:cursor-not-allowed disabled:opacity-40"><span className="material-symbols-outlined text-lg">chevron_left</span></button>
          {Array.from({ length: totalPages }, (_, page) => <button type="button" key={page} aria-label={`Trang ${page + 1}`} aria-current={page === currentPage ? "page" : undefined} onClick={() => goToPage(page)} className={`grid size-10 place-items-center rounded-full text-sm font-semibold ${page === currentPage ? "bg-[#2e7d32] text-white" : "text-[#2e7d32] hover:bg-[#eaf6ea]"}`}>{page + 1}</button>)}
          <button type="button" aria-label="Trang sau" disabled={currentPage >= totalPages - 1 || isFetching} onClick={() => goToPage(Math.min(totalPages - 1, currentPage + 1))} className="grid size-10 place-items-center rounded-full border border-slate-200 text-[#2e7d32] hover:bg-[#eaf6ea] disabled:cursor-not-allowed disabled:opacity-40"><span className="material-symbols-outlined text-lg">chevron_right</span></button>
        </nav>
      )}
    </section>
  );
}
