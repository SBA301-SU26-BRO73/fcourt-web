const docsSections = [
  {
    title: 'Them page moi',
    items: [
      'Tao folder trong src/pages',
      'Tao component page va component con neu can',
      'Dang ky route trong src/app/router.tsx',
    ],
  },
  {
    title: 'Lam viec voi API',
    items: [
      'Khai bao prefix va endpoint trong src/common/constants/api-endpoints.ts',
      'Doc base URL tu src/common/config/env.ts',
      'Dung axiosClient va import endpoint constant thay vi hardcode string',
    ],
  },
  {
    title: 'UI va reuse',
    items: [
      'Component dung chung dat trong src/components',
      'Layout cap route dat trong src/layouts',
      'Helper va type dung chung dat trong src/utils va src/types',
    ],
  },
]

export function DocsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="max-w-3xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-600">
          Project Guide
        </p>
        <h2 className="text-4xl font-black tracking-tight text-slate-950">
          Quy uoc de team code cung mot style.
        </h2>
        <p className="text-lg leading-8 text-slate-600">
          Page nay ghi nhanh nhung diem quan trong de onboarding va chia task.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {docsSections.map((section) => (
          <section
            key={section.title}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-xl font-semibold text-slate-900">
              {section.title}
            </h3>
            <ul className="mt-4 space-y-3 pl-5 text-sm leading-7 text-slate-600">
              {section.items.map((item) => (
                <li key={item} className="list-disc">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
