import SidebarFilters from "./components/sidebar-filters";
import BranchList from "./components/branch-list";

export default function BranchListPage() {
  return (
    <div className="w-full">
      <SidebarFilters />
      <div className="mx-auto w-full max-w-[1280px] px-4 py-12 md:px-12 md:py-16">
        <BranchList />
      </div>
    </div>
  );
}
