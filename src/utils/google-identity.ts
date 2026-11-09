/** Minimal types for Google Identity Services (https://accounts.google.com/gsi/client). */
export interface GoogleCredentialResponse {
  credential: string
}

interface GoogleAccountsId {
  initialize: (config: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void
  renderButton: (parent: HTMLElement, options: Record<string, string | number>) => void
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } }
  }
}

const GSI_SRC = 'https://accounts.google.com/gsi/client'
let loading: Promise<GoogleAccountsId> | null = null

/** Loads the GSI script once and resolves with `google.accounts.id`. */
export function loadGoogleIdentity(): Promise<GoogleAccountsId> {
  if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id)
  if (loading) return loading

  loading = new Promise<GoogleAccountsId>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = GSI_SRC
    script.async = true
    script.defer = true
    script.onload = () => {
      if (window.google?.accounts?.id) resolve(window.google.accounts.id)
      else reject(new Error('Google Identity Services không khả dụng.'))
    }
    script.onerror = () => reject(new Error('Không tải được Google Identity Services.'))
    document.head.appendChild(script)
  }).catch((error) => {
    loading = null
    throw error
  })
  return loading
}
