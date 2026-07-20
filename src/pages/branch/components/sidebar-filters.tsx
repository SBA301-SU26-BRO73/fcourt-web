import { useEffect, useState, type FormEvent } from 'react'
import { useCourtTypes } from '@/hooks/use-court-types'
import { findLocationCity, findLocationDistrict, sampleLocations } from '@/data/sample-locations'
import { useSearchParams } from 'react-router-dom'

export default function SidebarFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data, isPending, isError } = useCourtTypes()
  const currentCourtType = searchParams.get('courtTypeName')
  const city = searchParams.get('city') ?? ''
  const district = searchParams.get('district') ?? ''
  const ward = searchParams.get('ward') ?? ''
  const [keyword, setKeyword] = useState(searchParams.get('keyword') ?? '')
  const activeCourtTypes = data?.data?.content.filter((type) => type.active) ?? []
  const districts = findLocationCity(city)?.districts ?? []
  const wards = findLocationDistrict(city, district)?.wards ?? []

  useEffect(() => setKeyword(searchParams.get('keyword') ?? ''), [searchParams])

  const updateParams = (updates: Record<string, string | null>) => {
    const nextParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => value ? nextParams.set(key, value) : nextParams.delete(key))
    nextParams.delete('page')
    setSearchParams(nextParams)
  }

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    updateParams({ keyword: keyword.trim() || null })
  }

  return (
    <section className="relative overflow-hidden bg-[#f8f9fa] pb-10 pt-8 md:pb-12 md:pt-10">
      <div className="mx-auto max-w-[1280px] px-4 md:px-12">
        <h1 className="mb-7 text-4xl font-bold tracking-tight text-[#191c1d] md:text-[48px] md:leading-[56px]">
          Tìm sân <span className="text-[#2e7d32]">phù hợp</span> với bạn
        </h1>
        <div className="rounded-2xl border border-[#e1e3e4] bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] md:p-5">
          <form onSubmit={submitSearch} className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(280px,2fr)_minmax(180px,1fr)_minmax(180px,1fr)_auto]">
            <label className="relative block">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#717a6d]">search</span>
              <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm theo tên sân hoặc địa điểm" className="w-full rounded-xl border-0 bg-[#f3f4f5] py-3 pl-12 pr-4 text-sm text-[#191c1d] outline-none ring-0 placeholder:text-[#717a6d] focus:ring-2 focus:ring-[#2e7d32]" />
            </label>
            <select value={city} onChange={(event) => updateParams({ city: event.target.value || null, district: null, ward: null })} className="rounded-xl border-0 bg-[#f3f4f5] px-4 py-3 text-sm text-[#41493e] outline-none focus:ring-2 focus:ring-[#2e7d32]">
              <option value="">Tất cả thành phố</option>
              {sampleLocations.map((location) => <option key={location.city}>{location.city}</option>)}
            </select>
            <select value={district} disabled={!city} onChange={(event) => updateParams({ district: event.target.value || null, ward: null })} className="rounded-xl border-0 bg-[#f3f4f5] px-4 py-3 text-sm text-[#41493e] outline-none focus:ring-2 focus:ring-[#2e7d32] disabled:cursor-not-allowed disabled:opacity-60">
              <option value="">Tất cả quận/huyện</option>
              {districts.map((item) => <option key={item.name}>{item.name}</option>)}
            </select>
            <button type="submit" className="rounded-xl bg-[#2e7d32] px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#256b29] active:scale-[0.98]">Tìm sân</button>
          </form>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm font-medium text-[#41493e]">Loại sân:</span>
            {isPending ? <span className="text-sm text-[#717a6d]">Đang tải...</span> : isError ? <span className="text-sm text-red-600">Không tải được loại sân.</span> : activeCourtTypes.map((type) => (
              <button key={type.id} type="button" onClick={() => updateParams({ courtTypeName: currentCourtType === type.name ? null : type.name })} className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${currentCourtType === type.name ? 'bg-[#2e7d32] text-white' : 'bg-[#edeeef] text-[#41493e] hover:bg-[#c8e6c9] hover:text-[#2e7d32]'}`}>
                {type.name}
              </button>
            ))}
            {city && district && (
              <select value={ward} onChange={(event) => updateParams({ ward: event.target.value || null })} className="ml-1 rounded-full border-0 bg-[#edeeef] px-3 py-1.5 text-xs text-[#41493e] outline-none focus:ring-2 focus:ring-[#2e7d32]">
                <option value="">Tất cả phường/xã</option>
                {wards.map((item) => <option key={item.name}>{item.name}</option>)}
              </select>
            )}
            {(keyword || city || district || ward || currentCourtType) && <button type="button" onClick={() => { setKeyword(''); setSearchParams({}) }} className="ml-auto text-xs font-semibold text-[#2e7d32] hover:underline">Xóa bộ lọc</button>}
          </div>
        </div>
      </div>
    </section>
  )
}
