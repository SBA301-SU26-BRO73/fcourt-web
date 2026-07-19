import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

interface CheckinQrCardProps {
  checkinCode: string | null
  bookingCode: string
}

/**
 * Check-in QR for a booking. Only renders once the backend has actually sent
 * a checkinCode — it stays null until the booking is CONFIRMED/CHECKED_IN.
 */
export function CheckinQrCard({ checkinCode, bookingCode }: CheckinQrCardProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!checkinCode) return
    let cancelled = false
    QRCode.toDataURL(checkinCode, { width: 240, margin: 1 }).then((url) => {
      if (!cancelled) setDataUrl(url)
    })
    return () => {
      cancelled = true
    }
  }, [checkinCode])

  if (!checkinCode) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-500">
        QR check-in sẽ hiển thị sau khi đơn được xác nhận.
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-5">
      {dataUrl ? (
        <img src={dataUrl} alt="Mã QR check-in" width={240} height={240} />
      ) : (
        <div className="h-[240px] w-[240px] animate-pulse rounded-lg bg-slate-100" />
      )}
      <div className="text-center">
        <div className="text-xs text-slate-400">Mã đơn</div>
        <div className="font-mono text-sm font-semibold text-slate-800">{bookingCode}</div>
      </div>
    </div>
  )
}
