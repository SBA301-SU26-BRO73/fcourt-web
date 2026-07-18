import { QrCode } from 'lucide-react';
import type { Booking } from '../../data/mockBookings';
import { formatAmount } from '../../data/mockBookings';

interface ReceiptPreviewProps {
  booking: Booking;
  size?: 'thumb' | 'full';
}

// Renders a realistic-looking mock bank transfer receipt
export function ReceiptPreview({ booking, size = 'thumb' }: ReceiptPreviewProps) {
  const isThumb = size === 'thumb';

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-white border border-border shadow-sm select-none ${
        isThumb ? 'w-14 h-14' : 'w-full'
      }`}
      style={{ fontFamily: 'monospace' }}
    >
      {isThumb ? (
        // Thumbnail: colored top bar + QR icon
        <div className="w-full h-full flex flex-col">
          <div className="h-3 w-full" style={{ background: booking.receiptColor }} />
          <div className="flex-1 flex items-center justify-center">
            <QrCode
              className="w-6 h-6"
              style={{ color: booking.receiptColor }}
            />
          </div>
        </div>
      ) : (
        // Full receipt
        <div className="p-6">
          {/* Bank header */}
          <div
            className="rounded-xl p-4 mb-5 text-white"
            style={{ background: booking.receiptColor }}
          >
            <div className="text-xs opacity-80 mb-1">Ngân hàng MB Bank</div>
            <div className="text-base font-bold">Chuyển khoản thành công</div>
            <div className="text-2xl font-bold mt-2 tracking-tight">
              {formatAmount(booking.amount)}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            {[
              { label: 'Mã giao dịch', value: `MB${booking.bookingCode}` },
              { label: 'Tài khoản nhận', value: '0123456789012' },
              { label: 'Chủ tài khoản', value: 'SPORTCOURT VIETNAM' },
              { label: 'Nội dung', value: booking.bookingCode },
              {
                label: 'Thời gian',
                value: new Date(booking.submittedAt).toLocaleString('vi-VN'),
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex justify-between items-start gap-4 py-2 border-b border-dashed border-border last:border-0"
              >
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {row.label}
                </span>
                <span className="text-xs text-right font-medium text-foreground break-all">
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* QR area */}
          <div className="mt-5 flex justify-center">
            <div className="w-20 h-20 border border-border rounded-xl flex items-center justify-center">
              <QrCode className="w-12 h-12 text-muted-foreground" />
            </div>
          </div>

          <div className="mt-4 text-center text-xs text-muted-foreground">
            Biên lai điện tử — MB Bank
          </div>
        </div>
      )}
    </div>
  );
}
