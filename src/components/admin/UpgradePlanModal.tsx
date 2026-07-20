import { useNavigate } from 'react-router-dom'
import { Zap, X, ShieldAlert, ArrowRight } from 'lucide-react'

interface UpgradePlanModalProps {
  isOpen: boolean
  onClose: () => void
  limitType?: 'BRANCH' | 'COURT' | 'GENERAL'
  message?: string | null
}

export function UpgradePlanModal({
  isOpen,
  onClose,
  limitType = 'GENERAL',
  message,
}: UpgradePlanModalProps) {
  const navigate = useNavigate()

  if (!isOpen) return null

  const getTitle = () => {
    if (limitType === 'BRANCH') return 'Đã đạt giới hạn chi nhánh'
    if (limitType === 'COURT') return 'Đã đạt giới hạn sân đấu'
    return 'Vượt quá giới hạn gói dịch vụ'
  }

  const getDefaultMessage = () => {
    if (limitType === 'BRANCH') {
      return 'Bạn đã đạt số lượng chi nhánh tối đa được phép của gói dịch vụ hiện tại. Vui lòng nâng cấp gói để thêm chi nhánh mới.'
    }
    if (limitType === 'COURT') {
      return 'Bạn đã đạt số lượng sân đấu tối đa được phép của gói dịch vụ hiện tại. Vui lòng nâng cấp gói để thêm sân mới.'
    }
    return 'Thao tác này vượt quá giới hạn gói dịch vụ hiện tại của bạn. Vui lòng nâng cấp gói để tiếp tục.'
  }

  const handleUpgrade = () => {
    onClose()
    navigate('/admin/subscriptions')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon & Badge */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-8 ring-amber-500/5">
            <ShieldAlert className="h-7 w-7" />
          </div>

          <h3 className="text-lg font-extrabold text-foreground tracking-tight">
            {getTitle()}
          </h3>

          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {message || getDefaultMessage()}
          </p>
        </div>

        {/* Plan Upgrade Box */}
        <div className="mt-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 flex items-center gap-3">
          <div className="rounded-lg bg-emerald-600 p-2 text-white shrink-0">
            <Zap className="h-4 w-4 fill-white" />
          </div>
          <div className="text-left min-w-0">
            <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              Nâng cấp lên gói Tiêu chuẩn hoặc Chuyên nghiệp
            </div>
            <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 truncate">
              Mở rộng hạn mức quản lý cho chi nhánh &amp; sân đấu của bạn
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-border bg-card py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Bỏ qua
          </button>

          <button
            type="button"
            onClick={handleUpgrade}
            className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs font-bold text-white transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.98]"
          >
            <span>Nâng cấp ngay</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
