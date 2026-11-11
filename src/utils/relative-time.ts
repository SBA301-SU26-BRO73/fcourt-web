const MINUTE = 60
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** "Vừa xong", "5 phút trước", "3 giờ trước", "2 ngày trước", then the date (dd/MM/yyyy) after a week. */
export function formatRelativeTime(iso: string, now: number = Date.now()): string {
  const time = Date.parse(iso)
  if (Number.isNaN(time)) return ''
  const seconds = Math.max(0, Math.floor((now - time) / 1000))
  if (seconds < MINUTE) return 'Vừa xong'
  if (seconds < HOUR) return `${Math.floor(seconds / MINUTE)} phút trước`
  if (seconds < DAY) return `${Math.floor(seconds / HOUR)} giờ trước`
  if (seconds < 7 * DAY) return `${Math.floor(seconds / DAY)} ngày trước`
  const date = new Date(time)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${date.getFullYear()}`
}
