import { useEffect, useState } from 'react'

import { remainingSeconds } from '@/utils/hold-countdown'

/**
 * Seconds left until an absolute deadline (epoch ms). Recomputed from the clock on every tick and
 * when the tab becomes visible again, so it never drifts or restarts. `null` means no deadline.
 */
export function useCountdown(deadline: number | null) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (deadline === null) return
    const tick = () => setNow(Date.now())
    const timer = window.setInterval(tick, 1000)
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [deadline])

  const remaining = deadline === null ? 0 : remainingSeconds(deadline, now)
  return { remaining, isExpired: deadline !== null && remaining <= 0 }
}
