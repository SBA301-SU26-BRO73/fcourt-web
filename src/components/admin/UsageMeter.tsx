import type { ReactNode } from 'react'

interface UsageMeterProps {
  icon: ReactNode
  label: string
  /** Current usage; undefined/null when the backend did not report it. */
  used?: number | null
  max: number
}

const UNLIMITED_FROM = 99

export function UsageMeter({ icon, label, used, max }: UsageMeterProps) {
  const unlimited = max >= UNLIMITED_FROM
  const maxText = unlimited ? '∞' : String(max)
  const hasUsage = typeof used === 'number'
  const atLimit = hasUsage && !unlimited && used >= max
  const nearLimit = hasUsage && !unlimited && !atLimit && max > 0 && used / max >= 0.8
  const percent = hasUsage && !unlimited && max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0
  const barColor = atLimit ? 'bg-destructive' : nearLimit ? 'bg-amber-500' : 'bg-emerald-600'
  const textColor = atLimit ? 'text-destructive' : nearLimit ? 'text-amber-600' : 'text-foreground'

  return (
    <div className="flex items-center gap-2.5 min-w-[150px]">
      <div className="rounded-lg bg-card p-2 border border-border shadow-xs">{icon}</div>
      <div className="flex-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        {hasUsage ? (
          <>
            <div className={`text-sm font-extrabold ${textColor}`}>
              Đã dùng {used} / tối đa {maxText}
            </div>
            {!unlimited && (
              <div
                role="progressbar"
                aria-label={`Mức sử dụng ${label.toLowerCase()}`}
                aria-valuemin={0}
                aria-valuemax={max}
                aria-valuenow={Math.min(used, max)}
                className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted"
              >
                <div className={`h-full rounded-full ${barColor}`} style={{ width: `${percent}%` }} />
              </div>
            )}
            {atLimit && <div className="mt-0.5 text-[11px] font-semibold text-destructive">Đã đạt giới hạn</div>}
            {nearLimit && <div className="mt-0.5 text-[11px] font-semibold text-amber-600">Sắp đạt giới hạn</div>}
          </>
        ) : (
          <div className="text-sm font-extrabold text-foreground">Tối đa {maxText}</div>
        )}
      </div>
    </div>
  )
}
