import { Copy, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

export function QRPaymentCard() {
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const bankingInfo = [
    { label: 'Ngân hàng', value: 'MB Bank', field: 'bank' },
    { label: 'Số tài khoản', value: '0123456789012', field: 'account' },
    { label: 'Chủ tài khoản', value: 'SPORTCOURT VIETNAM', field: 'holder' },
    { label: 'Số tiền', value: '350.000 VND', field: 'amount', highlight: true },
    { label: 'Nội dung', value: 'SC240529ABCD', field: 'content' },
  ];

  return (
    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">
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
          <div className="w-64 h-64 bg-white border-2 border-border rounded-2xl p-4 flex items-center justify-center">
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full"
              style={{ imageRendering: 'pixelated' }}
            >
              {/* VietQR QR Code Pattern */}
              <rect width="200" height="200" fill="white" />
              {/* Simplified QR code pattern */}
              {[...Array(20)].map((_, i) =>
                [...Array(20)].map((_, j) => {
                  const shouldFill = Math.random() > 0.5;
                  return shouldFill ? (
                    <rect
                      key={`${i}-${j}`}
                      x={i * 10}
                      y={j * 10}
                      width="10"
                      height="10"
                      fill="black"
                    />
                  ) : null;
                })
              )}
              {/* Position markers */}
              <rect x="10" y="10" width="50" height="50" fill="black" />
              <rect x="20" y="20" width="30" height="30" fill="white" />
              <rect x="140" y="10" width="50" height="50" fill="black" />
              <rect x="150" y="20" width="30" height="30" fill="white" />
              <rect x="10" y="140" width="50" height="50" fill="black" />
              <rect x="20" y="150" width="30" height="30" fill="white" />
            </svg>
          </div>
          <div className="text-center mt-3">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-lg">
              <span className="text-xs font-medium text-primary">VietQR</span>
            </div>
          </div>
        </div>

        {/* Banking Information */}
        <div className="flex-1 space-y-3">
          {bankingInfo.map((info) => (
            <div
              key={info.field}
              className={`border ${
                info.highlight ? 'border-primary/30 bg-accent/30' : 'border-border bg-card'
              } rounded-xl p-4 flex items-center justify-between hover:border-primary/50 transition-colors`}
            >
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-1">
                  {info.label}
                </div>
                <div
                  className={`text-sm font-semibold ${
                    info.highlight ? 'text-primary text-base' : 'text-foreground'
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

      <div className="mt-6 bg-accent/50 border border-primary/20 rounded-xl p-4">
        <p className="text-sm text-foreground">
          <span className="font-semibold">Lưu ý:</span> Vui lòng chuyển khoản
          đúng nội dung để hệ thống tự động xác nhận thanh toán của bạn.
        </p>
      </div>
    </div>
  );
}
