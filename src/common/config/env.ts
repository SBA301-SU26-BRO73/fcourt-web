const DEFAULT_API_URL = '/api'

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()

export const env = {
  apiUrl: (configuredApiUrl || DEFAULT_API_URL).replace(/\/+$/, ''),
} as const
