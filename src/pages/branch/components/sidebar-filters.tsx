import { useSearchParams } from 'react-router-dom'

import { useCourtTypes } from '@/hooks/use-court-types'
import {
  findLocationCity,
  findLocationDistrict,
  sampleLocations,
} from '@/data/sample-locations'

export default function SidebarFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data, isPending, isError } = useCourtTypes()
  const currentCourtType = searchParams.get('courtTypeName')
  const city = searchParams.get('city') ?? ''
  const district = searchParams.get('district') ?? ''
  const ward = searchParams.get('ward') ?? ''
  const activeCourtTypes = data?.data?.content.filter((type) => type.active) ?? []
  const districts = findLocationCity(city)?.districts ?? []
  const wards = findLocationDistrict(city, district)?.wards ?? []

  const updateParams = (updates: Record<string, string | null>) => {
    const nextParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) nextParams.set(key, value)
      else nextParams.delete(key)
    })
    nextParams.delete('page')
    setSearchParams(nextParams)
  }

  return (
    <aside className="hidden h-fit w-64 shrink-0 flex-col gap-stack-lg lg:flex">
      <div className="flex flex-col gap-1">
        <h2 className="font-headline-md text-headline-md leading-tight">Lọc sân</h2>
        <p className="text-body-sm text-on-surface-variant">Chọn loại sân bạn muốn đặt</p>
      </div>

      <div className="flex flex-col gap-3">
        <span className="font-label-md text-on-surface-variant">Loại sân</span>
        {isPending ? (
          <p className="text-body-sm text-on-surface-variant">Đang tải loại sân...</p>
        ) : isError ? (
          <p className="text-body-sm text-red-600">Không tải được loại sân.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {activeCourtTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => updateParams({ courtTypeName: currentCourtType === type.name ? null : type.name })}
                className={`rounded-full border px-3 py-1.5 text-label-sm transition-all ${
                  currentCourtType === type.name
                    ? 'border-primary bg-primary font-bold text-white'
                    : 'border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
                }`}
              >
                {type.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <span className="font-label-md text-on-surface-variant">Địa điểm</span>
        <select
          value={city}
          onChange={(event) => updateParams({ city: event.target.value || null, district: null, ward: null })}
          className="rounded-xl border border-outline-variant bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Tất cả thành phố</option>
          {sampleLocations.map((location) => <option key={location.city}>{location.city}</option>)}
        </select>
        <select
          value={district}
          disabled={!city}
          onChange={(event) => updateParams({ district: event.target.value || null, ward: null })}
          className="rounded-xl border border-outline-variant bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-slate-100"
        >
          <option value="">Tất cả quận/huyện</option>
          {districts.map((item) => <option key={item.name}>{item.name}</option>)}
        </select>
        <select
          value={ward}
          disabled={!district}
          onChange={(event) => updateParams({ ward: event.target.value || null })}
          className="rounded-xl border border-outline-variant bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-slate-100"
        >
          <option value="">Tất cả phường/xã</option>
          {wards.map((item) => <option key={item.name}>{item.name}</option>)}
        </select>
      </div>

      <button
        type="button"
        onClick={() => setSearchParams({})}
        className="rounded-xl border border-outline-variant px-4 py-3 text-label-md font-bold text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
      >
        Xóa bộ lọc
      </button>
    </aside>
  )
}
