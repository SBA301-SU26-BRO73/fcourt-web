import { Check, Clock, Copy, Landmark } from 'lucide-react';
import { useState } from 'react';

interface QRPaymentCardProps {
  branchName: string;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  bankQrImageUrl: string | null;
  amount: number;
  content: string;
  timeLeft: number;
  /** The checkout deadline passed: the QR is withdrawn so nobody pays a cancelled booking. */
  expired?: boolean;
}

export function QRPaymentCard({ branchName, bankName, bankAccountNumber, bankAccountName, bankQrImageUrl, amount, content, timeLeft, expired = false }: QRPaymentCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [qrLoadFailed, setQrLoadFailed] = useState(false);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const details = [
    { label: 'Ngân hàng', value: bankName || 'Chưa cấu hình', field: 'bank' },
    { label: 'Số tài khoản', value: bankAccountNumber || 'Chưa cấu hình', field: 'account' },
    { label: 'Chủ tài khoản', value: bankAccountName || 'Chưa cấu hình', field: 'holder' },
    { label: 'Nội dung chuyển khoản', value: content, field: 'content' },
  ];

  return (
    <section className="rounded-3xl border border-[#d8e8dc] bg-white p-6 shadow-[0_10px_35px_rgba(46,125,50,0.08)] md:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[#2e7d32]"><Landmark className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-[0.16em]">Chuyển khoản ngân hàng</span></div>
          <h2 className="text-2xl font-bold tracking-tight text-[#191c1d]">Thanh toán cho {branchName}</h2>
          <p className="mt-2 text-sm text-[#667267]">Quét mã QR bằng ứng dụng ngân hàng để hoàn tất đặt sân.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full bg-[#fff0ef] px-3 py-2 text-sm font-bold tabular-nums text-[#b7433d]"><Clock className="h-4 w-4" />{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</div>
      </div>

      <div className="grid items-center gap-7 lg:grid-cols-[minmax(290px,0.95fr)_minmax(0,1.05fr)]">
        <div className="flex flex-col items-center rounded-2xl bg-[#f3f6f4] p-5">
          <div className="flex aspect-square w-full max-w-[320px] items-center justify-center rounded-2xl border border-[#d8e8dc] bg-white p-3 shadow-sm">
            {expired ? <div className="px-6 text-center text-sm leading-6 text-[#b7433d]">Phiên thanh toán đã hết hạn. Vui lòng chọn lại khung giờ.</div> : bankQrImageUrl && !qrLoadFailed ? <img src={bankQrImageUrl} alt={`QR thanh toán ${branchName}`} className="h-full w-full object-contain" onError={() => setQrLoadFailed(true)} /> : <div className="px-6 text-center text-sm leading-6 text-[#667267]">{qrLoadFailed ? 'Không tải được mã QR. Vui lòng dùng thông tin chuyển khoản bên cạnh.' : 'Chưa có thông tin QR thanh toán.'}</div>}
          </div>
          <span className="mt-4 rounded-full bg-[#dff1e2] px-4 py-1.5 text-xs font-bold text-[#2e7d32]">VietQR</span>
          <p className="mt-3 text-center text-sm font-semibold text-[#41493e]">Quét để thanh toán nhanh</p>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl bg-[#eef8f0] p-4"><p className="text-xs font-medium text-[#667267]">Số tiền cần chuyển</p><p className="mt-1 text-2xl font-bold text-[#2e7d32]">{formatCurrency(amount)}</p></div>
          {details.map((detail) => <div key={detail.field} className="flex items-center justify-between gap-4 rounded-xl border border-[#d8e8dc] px-4 py-3"><div className="min-w-0"><p className="text-xs text-[#667267]">{detail.label}</p><p className="mt-1 break-words text-sm font-bold text-[#191c1d]">{detail.value}</p></div><button type="button" onClick={() => handleCopy(detail.value, detail.field)} className="relative shrink-0 rounded-lg p-2 text-[#2e7d32] transition-colors hover:bg-[#eef8f0]" aria-label={`Sao chép ${detail.label}`}><Copy className="h-4 w-4" />{copiedField === detail.field && <span className="absolute right-0 top-[-28px] whitespace-nowrap rounded-md bg-[#191c1d] px-2 py-1 text-[10px] text-white">Đã sao chép</span>}</button></div>)}
        </div>
      </div>

      <div className="mt-6 flex items-start gap-2 rounded-xl border border-[#c8e6c9] bg-[#f1faf2] px-4 py-3 text-xs leading-5 text-[#41493e]"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2e7d32]" /><p>Vui lòng chuyển khoản đúng số tiền và nội dung để hệ thống xác nhận thanh toán nhanh hơn.</p></div>
    </section>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
}
