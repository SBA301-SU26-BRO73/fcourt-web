import { Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { createPayment } from '@/services/booking/booking.api';
import type { CreateBookingsResponse } from '@/types/booking';

const MAX_SIZE_MB = 5;

interface UploadReceiptProps {
  bookingData: CreateBookingsResponse;
  paymentCode: string;
  isExpired?: boolean;
}

export function UploadReceipt({ bookingData, paymentCode, isExpired }: UploadReceiptProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    setError(null);

    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      setError('Chỉ chấp nhận file PNG hoặc JPG.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Kích thước file vượt quá ${MAX_SIZE_MB}MB.`);
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const clearFile = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setError(null);
    setSubmitting(true);

    try {
      const payment = await createPayment({
        branchId: bookingData.branchId,
        bookingIds: bookingData.bookings.map((booking) => booking.id),
        amount: bookingData.totalAmount,
        billImage: selectedFile,
      });

      navigate('/confirmation?paymentId=' + payment.id, {
        state: {
          booking: bookingData,
          payment,
          paymentCode,
          file: {
            name: selectedFile.name,
            size: selectedFile.size,
            previewUrl,
          },
        },
      });
    } catch (error) {
      setSubmitting(false);
      setError(error instanceof Error ? error.message : 'Không thể gửi biên lai.');
    }
  };

  return (
    <div className="mt-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Xác nhận thanh toán</h3>
          <p className="text-[11px] text-muted-foreground">Ảnh biên lai PNG/JPG, tối đa 5MB</p>
        </div>
        {error && <p className="text-xs font-medium text-destructive">{error}</p>}
      </div>

      <div className="flex items-center gap-3">
        <label
          htmlFor={isExpired ? undefined : "receipt-upload"}
          onDrop={isExpired ? undefined : handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={`flex h-16 w-48 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-xl border px-3 transition-colors ${
            isExpired
              ? 'border-destructive/30 bg-destructive/5 cursor-not-allowed opacity-60'
              : error
              ? 'border-destructive/50 bg-destructive/5 cursor-pointer'
              : selectedFile
              ? 'border-primary/50 bg-accent/20 cursor-pointer'
              : 'border-border bg-muted/30 hover:border-primary/50 cursor-pointer'
          }`}
        >
        <input
          ref={inputRef}
          type="file"
          id="receipt-upload"
          className="hidden"
          disabled={isExpired}
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleFileChange}
        />

        {selectedFile && previewUrl ? (
          <>
            <img src={previewUrl} alt="Biên lai xem trước" className="h-10 w-10 shrink-0 rounded-md object-cover" />
            <span className="truncate text-xs font-semibold text-foreground">Đổi ảnh</span>
          </>
        ) : (
          <>
            <Upload className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">Chọn ảnh biên lai</span>
          </>
        )}
        </label>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-foreground">
            {selectedFile?.name ?? (isExpired ? 'Đã hết thời gian giữ sân' : 'Chưa chọn ảnh biên lai')}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {selectedFile ? `${(selectedFile.size / 1024).toFixed(0)} KB • Sẵn sàng gửi` : 'Nhấn ô vuông để tải ảnh'}
          </p>
        </div>

        {selectedFile && !isExpired && (
          <button type="button" onClick={clearFile} className="rounded-lg p-1.5 hover:bg-muted" title="Xóa file">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}

        <button
          disabled={!selectedFile || submitting || isExpired}
          onClick={handleSubmit}
          className="shrink-0 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Đang gửi...' : 'Xác nhận'}
        </button>
      </div>

      {isExpired && (
        <p className="mt-2 text-xs text-destructive font-medium px-1">
          Thời hạn thanh toán đã hết. Vui lòng quay lại trang đặt sân và chọn lại slot mới.
        </p>
      )}

    </div>
  );
}

