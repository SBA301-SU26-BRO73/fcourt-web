import { useSearchParams } from "react-router-dom";

export default function SidebarFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const updateFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  };
  const currentCourtType = searchParams.get("courtTypeName");
  const courtTypes = ["Pickleball", "Tennis", "Badminton", "Squash"];
    return (
      <aside className="hidden lg:flex flex-col w-64 shrink-0 gap-stack-lg sticky top-24 h-fit mb-24 max-h-[calc(100vh-8rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden sidebar-mask">
        <div className="flex flex-col gap-1">
          <h3 className="font-headline-md text-headline-md leading-tight">Filters</h3>
          <p className="text-body-sm text-on-surface-variant">Refine your court search</p>
        </div>
  
        {/* Sport Type */}
        <div className="flex flex-col gap-3">
        <span className="font-label-md text-on-surface-variant">Sport Type</span>
        <div className="flex flex-wrap gap-2">
          {courtTypes.map((type) => (
            <button
              key={type}
              onClick={() => updateFilter("courtTypeName", currentCourtType === type ? null : type)}
              className={`px-3 py-1.5 rounded-full text-label-sm border transition-all ${
                currentCourtType === type
                  ? "border-primary bg-primary-container text-on-primary-container font-bold"
                  : "border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
  
        {/* Price Range */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="font-label-md text-on-surface-variant">Price Range /hr</span>
            <span className="text-label-sm font-bold text-primary">$20 - $120+</span>
          </div>
          <input className="w-full h-1.5 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary" max="150" min="20" type="range" defaultValue="80" />
        </div>
  
        {/* Toggle: Available Now */}
        <div className="flex items-center justify-between p-4 bg-secondary-container/20 border border-secondary/20 rounded-xl">
          <div className="flex flex-col">
            <span className="font-label-md text-on-secondary-container font-bold">Available Now</span>
            <span className="text-body-sm text-on-secondary-container/70">Show open slots</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
          </label>
        </div>
  
        {/* Ratings */}
        <div className="flex flex-col gap-3">
          <span className="font-label-md text-on-surface-variant">Rating</span>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20" defaultChecked />
              <span className="flex items-center gap-1 text-body-sm">
                <span className="material-symbols-outlined text-secondary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                4.0 & above
              </span>
            </label>
          </div>
        </div>
  
        {/* Indoor/Outdoor */}
        <div className="flex flex-col gap-3">
          <span className="font-label-md text-on-surface-variant">Venue Type</span>
          <div className="grid grid-cols-2 gap-2">
            <button className="py-2 px-3 border border-outline-variant rounded-lg text-label-sm hover:border-primary hover:text-primary transition-all">Indoor</button>
            <button className="py-2 px-3 border border-primary bg-primary/5 text-primary rounded-lg text-label-sm font-bold">Outdoor</button>
          </div>
        </div>
        <button 
        onClick={() => setSearchParams({})}
        className="py-3 bg-surface-container-highest text-on-surface-variant font-label-md rounded-xl hover:bg-surface-container-high transition-colors"
      >
        Reset All Filters
      </button>
      </aside>
    );
  }