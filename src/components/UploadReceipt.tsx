import { Upload, ImageIcon, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';

const MAX_SIZE_MB = 5;

export function UploadReceipt() {
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

  const handleSubmit = () => {
    if (!selectedFile) return;
    setSubmitting(true);

    // Navigate to confirmation, passing file metadata and preview URL via router state
    navigate('/confirmation', {
      state: {
        file: {
          name: selectedFile.name,
          size: selectedFile.size,
          previewUrl,
        },
      },
    });
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-foreground mb-1">
        Xác nhận thanh toán
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Tải lên ảnh chụp màn hình hoặc biên lai chuyển khoản của bạn
      </p>

      {/* Drop zone */}
      <label
        htmlFor="receipt-upload"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`block border-2 border-dashed rounded-2xl transition-colors cursor-pointer ${
          error
            ? 'border-destructive/50 bg-destructive/5'
            : selectedFile
            ? 'border-primary/50 bg-accent/20'
            : 'border-border bg-muted/30 hover:border-primary/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          id="receipt-upload"
          className="hidden"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleFileChange}
        />

        {selectedFile && previewUrl ? (
          <div className="p-6 flex gap-5 items-center">
            <div className="w-24 h-24 rounded-xl overflow-hidden border border-border flex-shrink-0">
              <img
                src={previewUrl}
                alt="Biên lai xem trước"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(selectedFile.size / 1024).toFixed(0)} KB • PNG/JPG
                  </p>
                </div>
                <button
                  onClick={clearFile}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
                  title="Xóa file"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs text-primary font-medium">Sẵn sàng gửi</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-10">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
              {error ? (
                <ImageIcon className="w-8 h-8 text-destructive" />
              ) : (
                <Upload className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <p className="font-semibold text-foreground mb-1">
              Kéo thả hoặc nhấn để chọn ảnh
            </p>
            <p className="text-sm text-muted-foreground">
              Định dạng: PNG, JPG — Tối đa {MAX_SIZE_MB}MB
            </p>
          </div>
        )}
      </label>

      {error && (
        <p className="mt-2 text-xs text-destructive font-medium px-1">{error}</p>
      )}

      <button
        disabled={!selectedFile || submitting}
        onClick={handleSubmit}
        className="w-full mt-5 bg-primary text-primary-foreground py-4 px-6 rounded-xl font-semibold text-base hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Đang gửi...
          </>
        ) : (
          'Tôi đã chuyển khoản'
        )}
      </button>
    </div>
  );
}
