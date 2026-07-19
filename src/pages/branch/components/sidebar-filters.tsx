import { useSearchParams } from "react-router-dom";

export default function SidebarFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCourtType = searchParams.get("courtTypeName");
  const courtTypes = ["Pickleball", "Tennis", "Badminton", "Squash"];

  const updateFilter = (value: string | null) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) nextParams.set("courtTypeName", value);
    else nextParams.delete("courtTypeName");
    nextParams.delete("page");
    setSearchParams(nextParams);
  };

  return (
    <aside className="hidden h-fit w-64 shrink-0 flex-col gap-stack-lg lg:flex">
      <div className="flex flex-col gap-1">
        <h2 className="font-headline-md text-headline-md leading-tight">Lọc sân</h2>
        <p className="text-body-sm text-on-surface-variant">Chọn loại sân bạn muốn đặt</p>
      </div>

      <div className="flex flex-col gap-3">
        <span className="font-label-md text-on-surface-variant">Loại sân</span>
        <div className="flex flex-wrap gap-2">
          {courtTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => updateFilter(currentCourtType === type ? null : type)}
              className={`rounded-full border px-3 py-1.5 text-label-sm transition-all ${
                currentCourtType === type
                  ? "border-primary bg-primary text-white font-bold"
                  : "border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setSearchParams({})}
        className="rounded-xl border border-outline-variant px-4 py-3 text-label-md font-bold text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
      >
        Xóa bộ lọc
      </button>
    </aside>
  );
}
