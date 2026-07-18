import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

type Action = 'approve' | 'reject';

interface ConfirmModalProps {
  open: boolean;
  action: Action;
  bookingCode: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const actionConfig: Record<
  Action,
  {
    icon: React.ReactNode;
    iconBg: string;
    title: string;
    description: string;
    confirmLabel: string;
    confirmClass: string;
  }
> = {
  approve: {
    icon: <CheckCircle2 className="w-7 h-7 text-emerald-600" />,
    iconBg: 'bg-emerald-50',
    title: 'Xác nhận đặt sân',
    description:
      'Bạn có chắc muốn xác nhận đơn đặt sân này? Trạng thái sẽ được cập nhật thành đã xác nhận.',
    confirmLabel: 'Xác nhận',
    confirmClass:
      'bg-primary text-primary-foreground hover:bg-primary/90',
  },
  reject: {
    icon: <XCircle className="w-7 h-7 text-red-600" />,
    iconBg: 'bg-red-50',
    title: 'Hủy đặt sân',
    description:
      'Bạn có chắc muốn hủy đơn đặt sân này? Trạng thái sẽ được cập nhật thành đã hủy.',
    confirmLabel: 'Hủy đơn',
    confirmClass:
      'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  },
};

export function ConfirmModal({
  open,
  action,
  bookingCode,
  loading,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  const cfg = actionConfig[action];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={loading ? undefined : onCancel}
      />

      {/* Modal */}
      <div className="relative bg-card rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Icon */}
        <div
          className={`w-14 h-14 rounded-2xl ${cfg.iconBg} flex items-center justify-center mb-5`}
        >
          {cfg.icon}
        </div>

        <h3 className="text-foreground mb-2">{cfg.title}</h3>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-muted-foreground">Mã đơn:</span>
          <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-foreground">
            {bookingCode}
          </code>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
          {cfg.description}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-muted text-foreground py-3 rounded-xl font-medium text-sm hover:bg-muted/80 transition-colors disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-3 rounded-xl font-medium text-sm transition-colors disabled:opacity-70 flex items-center justify-center gap-2 ${cfg.confirmClass}`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              cfg.confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
