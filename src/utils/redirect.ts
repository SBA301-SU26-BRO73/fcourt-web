import type { UserRole } from '@/types/auth'

/** A safe same-app path for the post-login redirect (`?next=`), or null. */
export function safeNextPath(value: string | null | undefined) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return null
  return value
}

/**
 * Where to go after a login: the `?next=` path of the login URL for a customer (for example
 * back to /payment with a live slot hold), otherwise the home page of the role.
 */
export function readLoginRedirect(role: UserRole, fallback: string, search = window.location.search) {
  if (role !== 'CUSTOMER') return fallback
  return safeNextPath(new URLSearchParams(search).get('next')) ?? fallback
}
