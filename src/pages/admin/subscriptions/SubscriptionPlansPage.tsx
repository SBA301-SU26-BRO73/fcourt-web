import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ShieldCheck, Zap, AlertCircle, Building2, Layout, Calendar } from 'lucide-react'
import { getSubscriptionPlans, getMyActiveSubscription, subscribePlan } from '@/services/subscription/subscription.api'
import { SubscriptionPlanCard } from '@/components/admin/SubscriptionPlanCard'
import type { SubscriptionPlan, Subscription } from '@/types/subscription'

export default function SubscriptionPlansPage() {
  const queryClient = useQueryClient()
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Fetch active plans list
  const { data: plans = [], isLoading: isLoadingPlans } = useQuery<SubscriptionPlan[]>({
    queryKey: ['subscriptionPlans'],
    queryFn: getSubscriptionPlans,
  })

  // Fetch logged in admin's active subscription
  const { data: currentSub = null, isLoading: isLoadingSub } = useQuery<Subscription | null>({
    queryKey: ['myActiveSubscription'],
    queryFn: async () => {
      try {
        return await getMyActiveSubscription()
      } catch {
        return null
      }
    },
  })

  // Mutation to subscribe
  const subscribeMutation = useMutation({
    mutationFn: (planId: number) => subscribePlan({ planId, billingCycle }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['myActiveSubscription'] })
      setToastMessage(`Đã đăng ký thành công gói ${data.plan.name}!`)
      setErrorMessage(null)
      setTimeout(() => setToastMessage(null), 5000)
    },
    onError: (err: unknown) => {
      const errorResponse = err as { response?: { data?: { message?: string } }; message?: string }
      const msg = errorResponse?.response?.data?.message || errorResponse?.message || 'Không thể đăng ký gói dịch vụ.'
      setErrorMessage(msg)
      setTimeout(() => setErrorMessage(null), 6000)
    },
  })

  const handleSubscribe = (planId: number) => {
    setErrorMessage(null)
    subscribeMutation.mutate(planId)
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2.5">
            <Zap className="h-6 w-6 text-emerald-600 fill-emerald-600/20" />
            Gói dịch vụ &amp; Hạn mức
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Chọn gói dịch vụ phù hợp với quy mô kinh doanh của bạn. Nâng cấp bất cứ lúc nào để mở rộng giới hạn chi nhánh và sân đấu.
          </p>
        </div>

        {/* Toggle Monthly / Yearly */}
        <div className="inline-flex items-center rounded-xl bg-muted p-1 border border-border">
          <button
            onClick={() => setBillingCycle('MONTHLY')}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
              billingCycle === 'MONTHLY'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Thanh toán hàng tháng
          </button>
          <button
            onClick={() => setBillingCycle('YEARLY')}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 ${
              billingCycle === 'YEARLY'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Thanh toán hàng năm</span>
            <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
              Tiết kiệm
            </span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {toastMessage && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs font-medium text-emerald-700 dark:text-emerald-400 animate-in fade-in">
          <ShieldCheck className="h-5 w-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 rounded-xl bg-destructive/10 border border-destructive/30 p-4 text-xs font-medium text-destructive animate-in fade-in">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Current Subscription Status Card */}
      {currentSub && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  GÓI HIỆN TẠI
                </span>
                <span className="rounded-md bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5">
                  {currentSub.plan.name}
                </span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                Thời hạn: {currentSub.startDate} đến {currentSub.endDate}
              </p>
            </div>

            {/* Usage Stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-card p-2 border border-border shadow-xs">
                  <Building2 className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Chi nhánh</div>
                  <div className="text-sm font-extrabold text-foreground">
                    {currentSub.currentBranchCount ?? 0} /{' '}
                    {currentSub.maxBranches >= 99 ? '∞' : currentSub.maxBranches}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-card p-2 border border-border shadow-xs">
                  <Layout className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Sân đấu</div>
                  <div className="text-sm font-extrabold text-foreground">
                    {currentSub.currentCourtCount ?? 0} /{' '}
                    {currentSub.maxCourts >= 99 ? '∞' : currentSub.maxCourts}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      {isLoadingPlans || isLoadingSub ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 rounded-2xl bg-muted/50 border border-border" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <SubscriptionPlanCard
              key={plan.id}
              plan={plan}
              currentSubscription={currentSub}
              billingCycle={billingCycle}
              onSubscribe={handleSubscribe}
              submitting={subscribeMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  )
}
