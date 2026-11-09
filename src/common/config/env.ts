const DEFAULT_API_URL = '/api'

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()

export const env = {
  apiUrl: (configuredApiUrl || DEFAULT_API_URL).replace(/\/+$/, ''),
  /** OAuth Web client ID for Google sign-in; the button is hidden when empty. */
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? '',
} as const
