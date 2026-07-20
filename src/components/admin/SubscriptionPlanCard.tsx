import { Check, Zap, Sparkles } from 'lucide-react'
import type { SubscriptionPlan, Subscription } from '@/types/subscription'

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan
  currentSubscription?: Subscription | null
  billingCycle: 'MONTHLY' | 'YEARLY'
  onSubscribe: (planId: number) => void
  submitting?: boolean
}

export function translateSubscriptionText(text?: string): string {
  return text || ''
}

export function SubscriptionPlanCard({
  plan,
  currentSubscription,
  billingCycle,
  onSubscribe,
  submitting = false,
}: SubscriptionPlanCardProps) {
  const isCurrentPlan = currentSubscription?.plan?.id === plan.id && currentSubscription?.active

  const price = billingCycle === 'YEARLY' ? plan.yearlyPrice : plan.monthlyPrice
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val)

  return (
    <div
      className={`relative flex flex-col justify-between rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-lg ${
        plan.popular
          ? 'border-emerald-500/50 ring-2 ring-emerald-500/20 shadow-emerald-500/5'
          : 'border-border'
      } ${isCurrentPlan ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-500' : ''}`}
    >
      {plan.popular && !isCurrentPlan && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          Phổ biến nhất
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
          <Check className="h-3.5 w-3.5" />
          Gói đang dùng
        </div>
      )}

      <div>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xl font-bold text-foreground">
            {plan.name}
          </h3>
          {plan.color && (
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: plan.color }}
            />
          )}
        </div>

        {plan.tagline && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            {plan.tagline}
          </p>
        )}

        <div className="my-5 border-b border-border pb-5">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-foreground">
              {formatCurrency(price)}
            </span>
            <span className="text-xs text-muted-foreground">
              /{billingCycle === 'YEARLY' ? 'năm' : 'tháng'}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
            <span className="rounded-md bg-muted px-2.5 py-1 text-muted-foreground">
              {plan.maxBranches >= 99 ? 'Không giới hạn chi nhánh' : `Tối đa ${plan.maxBranches} chi nhánh`}
            </span>
            <span className="rounded-md bg-muted px-2.5 py-1 text-muted-foreground">
              {plan.maxCourts >= 99 ? 'Không giới hạn sân' : `Tối đa ${plan.maxCourts} sân`}
            </span>
          </div>
        </div>

        {plan.features && plan.features.length > 0 && (
          <ul className="space-y-2.5 text-xs text-muted-foreground">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                <span className="leading-tight text-foreground">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        {isCurrentPlan ? (
          <button
            disabled
            className="w-full rounded-xl bg-emerald-600/15 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 cursor-default flex items-center justify-center gap-1.5"
          >
            <Check className="h-4 w-4" />
            Gói đang hoạt động
          </button>
        ) : (
          <button
            onClick={() => onSubscribe(plan.id)}
            disabled={submitting}
            className="w-full rounded-xl py-2.5 text-xs font-bold text-white transition-all flex items-center justify-center gap-2 shadow-sm bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className="h-3.5 w-3.5 fill-white" />
            {currentSubscription ? 'Nâng cấp ngay' : 'Đăng ký ngay'}
          </button>
        )}
      </div>
    </div>
  )
}
