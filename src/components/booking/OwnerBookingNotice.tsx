import { Link } from 'react-router-dom'

export const OWNER_BOOKING_MESSAGE = 'Chủ sân vui lòng nhờ nhân viên sử dụng tài khoản STAFF tại Quầy / Walk-in (Đặt sân vãng lai, /staff/walk-in) để đặt sân cho khách bằng tên và số điện thoại.'

export function OwnerBookingNotice() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      <p>{OWNER_BOOKING_MESSAGE}</p>
      <Link to="/admin/staff" className="mt-2 inline-block font-semibold underline">Quản lý nhân viên</Link>
    </div>
  )
}
