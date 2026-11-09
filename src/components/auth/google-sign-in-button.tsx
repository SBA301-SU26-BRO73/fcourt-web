import { useEffect, useRef, useState } from 'react'

import { env } from '@/common/config/env'
import { loadGoogleIdentity } from '@/utils/google-identity'

interface GoogleSignInButtonProps {
  /** Called with the Google ID token (`credential`) to send to POST /auth/google. */
  onCredential: (idToken: string) => void
  disabled?: boolean
}

/** Renders the official Google button. Renders nothing when VITE_GOOGLE_CLIENT_ID is not set. */
export function GoogleSignInButton({ onCredential, disabled }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const callbackRef = useRef(onCredential)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    callbackRef.current = onCredential
  })

  useEffect(() => {
    if (!env.googleClientId) return
    let cancelled = false
    loadGoogleIdentity()
      .then((accountsId) => {
        if (cancelled || !containerRef.current) return
        accountsId.initialize({
          client_id: env.googleClientId,
          callback: (response) => callbackRef.current(response.credential),
        })
        accountsId.renderButton(containerRef.current, { type: 'standard', theme: 'outline', size: 'large', text: 'signin_with', shape: 'pill', width: 320 })
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => { cancelled = true }
  }, [])

  if (!env.googleClientId) return null
  if (failed) {
    return <p className="text-center text-xs text-slate-400">Không tải được đăng nhập Google. Vui lòng thử lại sau.</p>
  }

  return (
    <div className={disabled ? 'pointer-events-none opacity-60' : undefined}>
      <div ref={containerRef} className="flex justify-center" />
    </div>
  )
}
