import { Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { getApiErrorMessage } from '@/common/utils/api-error';
import { validateReceiptFile } from '@/services/payment/customer-payment.api';

interface UploadReceiptProps {
  /** Sends the file; resolves when the server accepted the receipt. */
  onSubmit: (file: File) => Promise<unknown>;
  /** Called after a successful upload with the picked file and its local preview URL. */
  onUploaded: (file: { name: string; size: number; previewUrl: string }) => void;
  isExpired?: boolean;
}

export function UploadReceipt({ onSubmit, onUploaded, isExpired }: UploadReceiptProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const keepPreviewRef = useRef(false);

  // The preview URL is handed to the confirmation page after a successful upload, so only revoke otherwise.
  useEffect(() => {
    return () => {
      if (previewUrl && !keepPreviewRef.current) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    setError(null);

    const invalid = validateReceiptFile(file);
    if (invalid) {
      setError(invalid);
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const clearFile = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!selectedFile || !previewUrl || submittingRef.current) return;
    submittingRef.current = true;
    setError(null);
    setSubmitting(true);

    try {
      await onSubmit(selectedFile);
      keepPreviewRef.current = true;
      onUploaded({ name: selectedFile.name, size: selectedFile.size, previewUrl });
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Không thể gửi biên lai.'));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div className="mb-4 rounded-2xl border border-[#d8e8dc] bg-white p-5 shadow-[0_6px_20px_rgba(46,125,50,0.05)]">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#191c1d]">Xác nhận thanh toán</h3>
          <p className="text-[11px] text-[#667267]">Ảnh biên lai PNG/JPG, tối đa 5MB</p>
        </div>
        {error && <p role="alert" className="text-xs font-medium text-destructive">{error}</p>}
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
            disabled={isExpired || submitting}
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleFileChange}
          />

          {selectedFile && previewUrl ? (
            <>
              <img src={previewUrl} alt="Biên lai xem trước" className="h-10 w-10 shrink-0 rounded-md object-cover" />
              <span className="truncate text-xs font-semibold text-[#191c1d]">Đổi ảnh</span>
            </>
          ) : (
            <>
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs font-semibold text-[#191c1d]">Chọn ảnh biên lai</span>
            </>
          )}
        </label>

        {selectedFile && !isExpired && !submitting && (
          <button type="button" onClick={clearFile} className="rounded-lg p-1.5 hover:bg-muted" title="Xóa file" aria-label="Xóa ảnh đã chọn">
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
          Thời hạn thanh toán đã hết. Vui lòng quay lại trang đặt sân và chọn lại khung giờ.
        </p>
      )}
    </div>
  );
}
