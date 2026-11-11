export function BranchSelect({
  branches,
  value,
  onChange,
}: {
  branches: Array<{ id: number; name: string }>
  value: number | undefined
  onChange: (branchId: number) => void
}) {
  return (
    <select
      aria-label="Chọn chi nhánh"
      value={value ?? ''}
      onChange={(event) => onChange(Number(event.target.value))}
      className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
    >
      {branches.map((branch) => (
        <option key={branch.id} value={branch.id}>
          {branch.name}
        </option>
      ))}
    </select>
  )
}
