import SidebarFilters from "./components/sidebar-filters";
import BranchList from "./components/branch-list";

export default function BranchListPage() {
  return (
    <div className="pt-8 w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 flex gap-gutter">
      <SidebarFilters />
      <BranchList />
    </div>
  );
}