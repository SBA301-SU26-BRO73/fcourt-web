import { Loader2 } from 'lucide-react'

interface ActiveOrderDialogProps {
  title: string
  description: string
  /** Extra line under the description, e.g. the court and the remaining time. */
  detail?: string
  continueLabel: string
  replaceLabel: string
  busy?: boolean
  error?: string | null
  onContinue: () => void
  onReplace: () => void
  /** Leave things as they are (optional). */
  onDismiss?: () => void
}

/** Tells the customer about an unpaid booking or a live hold instead of silently sending them back to it. */
export default function ActiveOrderDialog({
  title,
  description,
  detail,
  continueLabel,
  replaceLabel,
  busy = false,
  error,
  onContinue,
  onReplace,
  onDismiss,
}: ActiveOrderDialogProps) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 px-4">
      <div role="alertdialog" aria-label={title} aria-describedby="active-order-desc" className="w-full max-w-md rounded-2xl border border-outline-variant/30 bg-white p-5 shadow-xl">
        <h2 className="text-lg font-bold text-on-surface">{title}</h2>
        <p id="active-order-desc" className="mt-2 text-sm text-on-surface-variant">{description}</p>
        {detail ? <p className="mt-2 text-sm font-semibold text-on-surface">{detail}</p> : null}
        {error ? <p role="alert" className="mt-3 text-sm font-medium text-destructive">{error}</p> : null}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
          <button
            type="button"
            disabled={busy}
            onClick={onContinue}
            className="primary-gradient w-full cursor-pointer rounded-xl px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {continueLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onReplace}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-outline-variant/60 bg-white px-4 py-3 text-sm font-bold text-on-surface disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : null}
            {replaceLabel}
          </button>
          {onDismiss ? (
            <button
              type="button"
              disabled={busy}
              onClick={onDismiss}
              className="w-full cursor-pointer rounded-xl px-4 py-3 text-sm font-semibold text-on-surface-variant hover:underline disabled:opacity-60 sm:mr-auto sm:w-auto"
            >
              Để sau
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
