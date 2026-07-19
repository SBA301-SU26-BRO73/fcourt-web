export type LocationWard = {
  name: string
}

export type LocationDistrict = {
  name: string
  wards: LocationWard[]
}

export type SampleLocation = {
  city: string
  districts: LocationDistrict[]
}

export const sampleLocations: SampleLocation[] = [
  {
    city: 'Hà Nội',
    districts: [
      { name: 'Ba Đình', wards: [{ name: 'Quán Thánh' }] },
      { name: 'Cầu Giấy', wards: [{ name: 'Dịch Vọng Hậu' }] },
      { name: 'Đống Đa', wards: [{ name: 'Trung Tự' }] },
      { name: 'Hai Bà Trưng', wards: [{ name: 'Bách Khoa' }] },
      { name: 'Hà Đông', wards: [{ name: 'Nguyễn Trãi' }] },
      { name: 'Hoàn Kiếm', wards: [{ name: 'Tràng Tiền' }] },
      { name: 'Thanh Xuân', wards: [{ name: 'Nhân Chính' }] },
      { name: 'Tây Hồ', wards: [{ name: 'Quảng An' }] },
    ],
  },
  {
    city: 'Đà Nẵng',
    districts: [
      { name: 'Cẩm Lệ', wards: [{ name: 'Khuê Trung' }] },
      { name: 'Hải Châu', wards: [{ name: 'Hải Châu I' }] },
      { name: 'Liên Chiểu', wards: [{ name: 'Hòa Khánh Nam' }] },
      { name: 'Sơn Trà', wards: [{ name: 'An Hải Đông' }, { name: 'Phước Mỹ' }] },
      { name: 'Thanh Khê', wards: [{ name: 'Chính Gián' }] },
    ],
  },
  {
    city: 'Hồ Chí Minh',
    districts: [
      { name: 'Bình Thạnh', wards: [{ name: 'Phường 15' }] },
      { name: 'Bình Tân', wards: [{ name: 'Bình Trị Đông B' }] },
      { name: 'Gò Vấp', wards: [{ name: 'Phường 10' }] },
      { name: 'Phú Nhuận', wards: [{ name: 'Phường 7' }] },
      { name: 'Quận 1', wards: [{ name: 'Bến Nghé' }] },
      { name: 'Quận 3', wards: [{ name: 'Võ Thị Sáu' }] },
      { name: 'Quận 7', wards: [{ name: 'Tân Phong' }] },
      { name: 'Quận 10', wards: [{ name: 'Phường 14' }] },
      { name: 'Tân Bình', wards: [{ name: 'Phường 12' }] },
      { name: 'Thủ Đức', wards: [{ name: 'Linh Chiểu' }] },
      { name: 'Nhà Bè', wards: [{ name: 'Phước Kiển' }] },
    ],
  },
]

export function findLocationCity(city: string) {
  return sampleLocations.find((location) => location.city === city)
}

export function findLocationDistrict(city: string, district: string) {
  return findLocationCity(city)?.districts.find((item) => item.name === district)
}

export function findDistrictForWard(city: string, ward: string) {
  return findLocationCity(city)?.districts.find((district) =>
    district.wards.some((item) => item.name === ward),
  )
}
