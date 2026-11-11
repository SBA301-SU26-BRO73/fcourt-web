import { useState } from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export type ConfirmAction = 'approve' | 'reject' | 'reject_payment' | 'reject_refund' | 'cancel_package';

/** Actions the server only accepts with a written reason (1-500 characters). */
const NEEDS_REASON: ConfirmAction[] = ['reject', 'reject_payment', 'reject_refund', 'cancel_package'];

interface ConfirmModalProps {
  open: boolean;
  action: ConfirmAction;
  bookingCode: string;
  loading: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

const actionConfig: Record<
  ConfirmAction,
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
      'Bạn có chắc muốn hủy đơn đặt sân này? Đơn đã thanh toán sẽ được hoàn tiền 100% và chuyển sang danh sách hoàn tiền.',
    confirmLabel: 'Hủy đơn',
    confirmClass:
      'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  },
  reject_payment: {
    icon: <XCircle className="w-7 h-7 text-amber-600" />,
    iconBg: 'bg-amber-50',
    title: 'Từ chối biên lai thanh toán',
    description:
      'Bạn có chắc muốn từ chối biên lai thanh toán này? Trạng thái sẽ quay lại chờ thanh toán (Pending Payment) và khách hàng có thể nộp lại biên lai khác.',
    confirmLabel: 'Từ chối bill',
    confirmClass:
      'bg-amber-600 text-white hover:bg-amber-700',
  },
  reject_refund: {
    icon: <XCircle className="w-7 h-7 text-red-600" />,
    iconBg: 'bg-red-50',
    title: 'Từ chối yêu cầu hoàn tiền',
    description: 'Bạn có chắc muốn từ chối yêu cầu hoàn tiền này? Khách hàng sẽ nhận được lý do từ chối.',
    confirmLabel: 'Từ chối',
    confirmClass: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  },
  cancel_package: {
    icon: <XCircle className="w-7 h-7 text-red-600" />,
    iconBg: 'bg-red-50',
    title: 'Hủy đặt cả sân',
    description: 'Tất cả booking của gói đặt cả sân sẽ bị hủy và khoảng thời gian được nhả khóa.',
    confirmLabel: 'Hủy gói',
    confirmClass: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  },
};

export function ConfirmModal(props: ConfirmModalProps) {
  // Remount per target so the reason box starts empty.
  return props.open ? <ConfirmModalBody key={`${props.action}-${props.bookingCode}`} {...props} /> : null;
}

function ConfirmModalBody({
  action,
  bookingCode,
  loading,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [reason, setReason] = useState('');
  const cfg = actionConfig[action];
  const needsReason = NEEDS_REASON.includes(action);
  const reasonMissing = needsReason && reason.trim().length === 0;

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

        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          {cfg.description}
        </p>

        {needsReason && (
          <div className="mb-6">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="confirm-reason">
              Lý do (bắt buộc)
            </label>
            <textarea
              id="confirm-reason"
              value={reason}
              maxLength={500}
              rows={3}
              onChange={(event) => setReason(event.target.value)}
              disabled={loading}
              className="mt-1.5 w-full resize-none rounded-xl bg-muted px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-muted text-foreground py-3 rounded-xl font-medium text-sm hover:bg-muted/80 transition-colors disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            onClick={() => onConfirm(reason.trim())}
            disabled={loading || reasonMissing}
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
