/**
 * Countdown helpers for a slot hold. The remaining time is always derived from the absolute
 * server expiry, so a rebuild, a background tab or a reload never restarts the 5 minutes.
 */

export const HOLD_WARNING_SECONDS = 60

export function remainingSeconds(expiresAt: number, now = Date.now()) {
  return Math.max(0, Math.ceil((expiresAt - now) / 1000))
}

export function isHoldExpired(expiresAt: number, now = Date.now()) {
  return expiresAt <= now
}

export function formatCountdown(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function isHoldWarning(seconds: number) {
  return seconds > 0 && seconds <= HOLD_WARNING_SECONDS
}
