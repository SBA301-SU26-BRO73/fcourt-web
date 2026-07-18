import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import type { BookingStatus } from '@/services/admin/booking.service';

interface StatusBadgeProps {
  status: BookingStatus | string;
  size?: 'sm' | 'md';
}

const config: Record<
  BookingStatus,
  { label: string; icon: React.ReactNode; classes: string }
> = {
  PENDING_PAYMENT: {
    label: 'Chờ thanh toán',
    icon: <Clock className="w-3.5 h-3.5" />,
    classes: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  AWAITING_CONFIRMATION: {
    label: 'Chờ xác nhận',
    icon: <Clock className="w-3.5 h-3.5" />,
    classes: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
  CHECKED_IN: {
    label: 'Đã check-in',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    classes: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
  },
  COMPLETED: {
    label: 'Hoàn tất',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    classes: 'bg-slate-50 text-slate-700 border border-slate-200',
  },
  CANCELLED: {
    label: 'Đã hủy',
    icon: <XCircle className="w-3.5 h-3.5" />,
    classes: 'bg-red-50 text-red-600 border border-red-200',
  },
};

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const normalizedStatus = status.toUpperCase() as BookingStatus;
  const { label, icon, classes } = config[normalizedStatus] ?? {
    label: status,
    icon: <Clock className="w-3.5 h-3.5" />,
    classes: 'bg-slate-50 text-slate-600 border border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${classes} ${
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'
      }`}
    >
      {icon}
      {label}
    </span>
  );
}
