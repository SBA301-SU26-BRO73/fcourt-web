import { AlertTriangle, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface ScanErrorOverlayProps {
  message: string
  onRetry: () => void
}

export function ScanErrorOverlay({ message, onRetry }: ScanErrorOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-rose-600/95 px-6 text-center text-white">
      <AlertTriangle size={36} />
      <div className="text-lg font-bold">Check-in failed</div>
      <div className="max-w-xs text-sm text-white/90">{message}</div>
      <Button
        variant="ghost"
        icon={<RotateCcw size={14} />}
        onClick={onRetry}
        className="mt-1 border-white/40 bg-white/10 text-white hover:bg-white/20"
      >
        Try again
      </Button>
    </div>
  )
}
