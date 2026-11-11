const DEFAULT_API_URL = '/api'

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()
const configuredWsUrl = import.meta.env.VITE_WS_URL?.trim()

/** Same-origin `/ws-fcourt` (proxied by nginx / the Vite dev proxy) unless VITE_WS_URL is set. */
export function resolveWsUrl(
  configured: string | undefined = configuredWsUrl,
  location: Pick<Location, 'protocol' | 'host'> | undefined = typeof window === 'undefined'
    ? undefined
    : window.location,
) {
  if (configured) return configured
  if (!location) return ''
  const scheme = location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${scheme}//${location.host}/ws-fcourt`
}

export const env = {
  apiUrl: (configuredApiUrl || DEFAULT_API_URL).replace(/\/+$/, ''),
  /** STOMP over WebSocket endpoint of booking-service (public court slot invalidations). */
  wsUrl: resolveWsUrl(),
  /** OAuth Web client ID for Google sign-in; the button is hidden when empty. */
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? '',
} as const
