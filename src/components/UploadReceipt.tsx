import { Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPayment } from '@/services/booking/booking.api';
import type { CreateBookingsResponse } from '@/types/booking';

const MAX_SIZE_MB = 5;

interface UploadReceiptProps {
  bookingData: CreateBookingsResponse;
  paymentCode: string;
  isExpired?: boolean;
  discount?: number;
  voucherCode?: string | null;
}

export function UploadReceipt({
  bookingData,
  paymentCode,
  isExpired,
  discount = 0,
  voucherCode,
}: UploadReceiptProps) {
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
      setError('Chi chap nhan file PNG hoac JPG.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Kich thuoc file vuot qua ${MAX_SIZE_MB}MB.`);
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
    if (!selectedFile || !bookingData) return;
    setError(null);
    setSubmitting(true);

    const finalAmount = Math.max(0, bookingData.totalAmount - discount);

    try {
      const payment = await createPayment({
        branchId: bookingData.branchId,
        bookingIds: bookingData.bookings.map((booking) => booking.id),
        amount: finalAmount,
        billImage: selectedFile,
        voucherCode: voucherCode || undefined,
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
    } catch (err: unknown) {
      setSubmitting(false);
      const errorResponse = err as { status?: number; detail?: string; message?: string };
      const serverMsg = errorResponse?.detail || errorResponse?.message || 'Không thể gửi biên lai.';
      setError(serverMsg);
    }
  };

  return (
    <div className="mb-4 rounded-2xl border border-[#d8e8dc] bg-white p-5 shadow-[0_6px_20px_rgba(46,125,50,0.05)]">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#191c1d]">Xác nhận thanh toán</h3>
          <p className="text-[11px] text-[#667267]">Ảnh biên lai PNG/JPG, tối đa 5MB</p>
        </div>
        {error && <p className="text-xs font-medium text-destructive">{error}</p>}
      </div>

      <div className="flex items-center gap-3">
        <label
          htmlFor={isExpired ? undefined : 'receipt-upload'}
          onDrop={isExpired ? undefined : handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={`flex h-16 min-w-0 flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl border px-3 transition-colors ${
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
              <img src={previewUrl} alt="Bien lai xem truoc" className="h-10 w-10 shrink-0 rounded-md object-cover" />
              <span className="truncate text-xs font-semibold text-[#191c1d]">Đổi ảnh</span>
            </>
          ) : (
            <>
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs font-semibold text-[#191c1d]">Chọn ảnh biên lai</span>
            </>
          )}
        </label>

        {selectedFile && !isExpired && (
          <button type="button" onClick={clearFile} className="rounded-lg p-1.5 hover:bg-muted" title="Xoa file">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}

        <button
          disabled={!selectedFile || submitting || isExpired}
          onClick={handleSubmit}
          className="shrink-0 rounded-xl bg-[#2e7d32] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#256b29] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Đang gửi...' : 'Xác nhận'}
        </button>
      </div>

      {isExpired && (
        <p className="mt-2 px-1 text-xs font-medium text-destructive">
          Thoi han thanh toan da het. Vui long quay lai trang dat san va chon lai slot moi.
        </p>
      )}
    </div>
  );
}
