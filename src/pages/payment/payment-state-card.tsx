import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

export function PaymentLoading({ label }: { label: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
      </div>
    </div>
  );
}

interface PaymentMessageProps {
  title: string;
  message: ReactNode;
  actions: Array<{ label: string; onClick: () => void; primary?: boolean; disabled?: boolean }>;
}

/** Full-page notice used by the payment and confirmation screens (same card as the old empty state). */
export function PaymentMessage({ title, message, actions }: PaymentMessageProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="bg-card border border-border rounded-3xl p-8 max-w-md w-full text-center shadow-sm">
        <h1 className="text-xl font-bold text-foreground mb-2">{title}</h1>
        <div className="text-sm text-muted-foreground mb-6">{message}</div>
        <div className="flex flex-col gap-3">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              disabled={action.disabled}
              onClick={action.onClick}
              className={
                action.primary === false
                  ? 'w-full bg-muted text-foreground py-3 rounded-xl font-semibold disabled:opacity-60'
                  : 'w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold disabled:opacity-60'
              }
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
