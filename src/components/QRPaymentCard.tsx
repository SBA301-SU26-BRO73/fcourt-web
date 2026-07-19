import { Copy, Clock } from 'lucide-react';
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
}

export function QRPaymentCard({
  branchName,
  bankName,
  bankAccountNumber,
  bankAccountName,
  bankQrImageUrl,
  amount,
  content,
  timeLeft,
}: QRPaymentCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const bankingInfo = [
    { label: 'Chi nhánh', value: branchName, field: 'branch' },
    { label: 'Ngân hàng', value: bankName || 'Chưa cấu hình', field: 'bank' },
    { label: 'Số tài khoản', value: bankAccountNumber || 'Chưa cấu hình', field: 'account' },
    { label: 'Chủ tài khoản', value: bankAccountName || 'Chưa cấu hình', field: 'holder' },
    { label: 'Số tiền', value: formatCurrency(amount), field: 'amount', highlight: true },
    { label: 'Nội dung', value: content, field: 'content' },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          Thanh toán nhanh qua app ngân hàng
        </h2>
        <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-xl">
          <Clock className="w-4 h-4" />
          <span className="font-semibold tabular-nums">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="flex gap-6">
        {/* QR Code Section */}
        <div className="flex-shrink-0">
          <div className="w-52 h-52 bg-white border-2 border-border rounded-xl p-3 flex items-center justify-center">
            {bankQrImageUrl ? (
              <img
                src={bankQrImageUrl}
                alt={`QR thanh toán ${branchName}`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center text-sm text-muted-foreground px-4">
                Chi nhánh chưa cấu hình QR thanh toán
              </div>
            )}
          </div>
          <div className="text-center mt-2">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-lg">
              <span className="text-xs font-medium text-primary">VietQR</span>
            </div>
          </div>
        </div>

        {/* Banking Information */}
        <div className="flex-1 grid grid-cols-2 gap-2 content-start">
          {bankingInfo.map((info) => (
            <div
              key={info.field}
              className={`border ${
                info.highlight ? 'border-primary/30 bg-accent/30' : 'border-border bg-card'
              } rounded-lg p-2.5 flex items-center justify-between hover:border-primary/50 transition-colors`}
            >
              <div className="flex-1">
                <div className="text-[11px] text-muted-foreground mb-0.5">
                  {info.label}
                </div>
                <div
                  className={`text-sm font-semibold ${
                    info.highlight ? 'text-primary text-sm' : 'text-foreground'
                  }`}
                >
                  {info.value}
                </div>
              </div>
              <button
                onClick={() => handleCopy(info.value, info.field)}
                className="ml-4 p-2 hover:bg-muted rounded-lg transition-colors group relative"
              >
                <Copy className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                {copiedField === info.field && (
                  <span className="absolute -top-8 right-0 bg-foreground text-background text-xs px-2 py-1 rounded">
                    Đã sao chép
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 bg-accent/50 border border-primary/20 rounded-lg p-3">
        <p className="text-xs text-foreground">
          <span className="font-semibold">Lưu ý:</span> Vui lòng chuyển khoản
          đúng nội dung để hệ thống tự động xác nhận thanh toán của bạn.
        </p>
      </div>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}


