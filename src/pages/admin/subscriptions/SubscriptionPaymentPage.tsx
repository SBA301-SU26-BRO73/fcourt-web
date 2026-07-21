import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import QRCode from 'qrcode'
import { CheckCircle2, Clock3, ExternalLink, ShieldCheck, XCircle } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import { getSubscriptionPayment } from '@/services/subscription/subscription.api'

export default function SubscriptionPaymentPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderCode = Number(searchParams.get('orderCode'))
  const [qrImage, setQrImage] = useState<string | null>(null)

  const { data: payment, isLoading, isError } = useQuery({
    queryKey: ['subscriptionPayment', orderCode],
    queryFn: () => getSubscriptionPayment(orderCode),
    enabled: Number.isSafeInteger(orderCode) && orderCode > 0,
    refetchInterval: (query) => query.state.data?.status === 'PENDING' ? 3000 : false,
  })

  useEffect(() => {
    if (!payment?.qrCode) return
    QRCode.toDataURL(payment.qrCode, { width: 300, margin: 2 }).then(setQrImage).catch(() => setQrImage(null))
  }, [payment?.qrCode])

  const formattedAmount = useMemo(() => new Intl.NumberFormat('vi-VN', {
    style: 'currency', currency: 'VND', maximumFractionDigits: 0,
  }).format(payment?.amount ?? 10000), [payment?.amount])

  if (!Number.isSafeInteger(orderCode) || orderCode <= 0 || isError) {
    return <ResultState icon={<XCircle className="h-12 w-12 text-red-500" />} title="Không tìm thấy giao dịch" message="Vui lòng quay lại trang gói dịch vụ và thử lại." onBack={() => navigate('/admin/subscriptions')} />
  }

  if (isLoading || !payment) {
    return <ResultState icon={<Clock3 className="h-12 w-12 text-emerald-600 animate-pulse" />} title="Đang tải thông tin thanh toán" message="Vui lòng chờ trong giây lát..." />
  }

  if (payment.status === 'PAID') {
    return <ResultState icon={<CheckCircle2 className="h-12 w-12 text-emerald-600" />} title="Thanh toán thành công" message={`Gói ${payment.planName} đã được kích hoạt.`} onBack={() => navigate('/admin/subscriptions')} />
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 p-4 md:grid-cols-[1fr_320px] md:p-8">
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Thanh toán PayOS</p>
            <h1 className="mt-2 text-2xl font-extrabold text-foreground">Hoàn tất mua gói dịch vụ</h1>
            <p className="mt-2 text-sm text-muted-foreground">Quét mã QR hoặc mở trang PayOS để thanh toán phí thử nghiệm.</p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">Đang chờ</span>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-[300px_1fr] md:items-center">
          <div className="flex min-h-[340px] flex-col items-center justify-center rounded-2xl bg-muted/60 p-5 text-center">
            {qrImage ? <img src={qrImage} alt="Mã QR thanh toán PayOS" className="h-[260px] w-[260px] rounded-xl bg-white p-2" /> : <div className="flex h-[260px] w-[260px] items-center justify-center rounded-xl bg-white text-sm text-muted-foreground">Không tạo được mã QR</div>}
            <p className="mt-4 text-xs font-semibold text-muted-foreground">Số tiền thanh toán: {formattedAmount}</p>
          </div>
          <div className="space-y-4">
            <Info label="Gói dịch vụ" value={payment.planName} />
            <Info label="Chu kỳ" value={payment.billingCycle === 'YEARLY' ? 'Hàng năm' : 'Hàng tháng'} />
            <Info label="Mã giao dịch" value={String(payment.orderCode)} />
            <a href={payment.checkoutUrl} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700">
              Mở trang thanh toán PayOS <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="mt-8 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Gói chỉ được kích hoạt sau khi hệ thống nhận và xác thực webhook thanh toán từ PayOS.</span>
        </div>
      </section>
      <aside className="h-fit rounded-3xl border border-border bg-card p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Lưu ý</p>
        <p className="mt-3 text-sm leading-6 text-foreground">Số tiền thanh toán thử nghiệm hiện được cố định ở <strong>10.000đ</strong>, không phụ thuộc giá niêm yết của gói.</p>
        <button onClick={() => navigate('/admin/subscriptions')} className="mt-6 w-full rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">Quay lại danh sách gói</button>
      </aside>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-border p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-bold text-foreground">{value}</p></div>
}

function ResultState({ icon, title, message, onBack }: { icon: ReactNode; title: string; message: string; onBack?: () => void }) {
  return <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center p-6 text-center"><div>{icon}</div><h1 className="mt-4 text-2xl font-extrabold text-foreground">{title}</h1><p className="mt-2 text-sm text-muted-foreground">{message}</p>{onBack && <button onClick={onBack} className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white">Quay lại gói dịch vụ</button>}</div>
}
