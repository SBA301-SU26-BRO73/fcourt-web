const DEFAULT_API_URL = '/api'

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()

export const env = {
  apiUrl: (configuredApiUrl || DEFAULT_API_URL).replace(/\/+$/, ''),
  // Temporary front-desk session seed until real staff auth exists.
  staffUserId: import.meta.env.VITE_STAFF_USER_ID ?? '',
  branchId: import.meta.env.VITE_BRANCH_ID ?? '',
} as const
