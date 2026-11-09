import { Check, LockKeyhole, Mail, Phone, Search, UnlockKeyhole, Users, X } from 'lucide-react'
import { useMemo, useState } from 'react'

import { useLockUser, useUnlockUser, useUserManagement } from '@/hooks/use-users'
import type { UserAdminItem, UserStatus } from '@/types/admin'
import type { UserRole } from '@/types/auth'

type ManagedRole = Extract<UserRole, 'CUSTOMER' | 'ADMIN'>

const ROLE_OPTIONS: Array<{ value: ManagedRole | ''; label: string }> = [
  { value: '', label: 'All roles' },
  { value: 'CUSTOMER', label: 'Customers' },
  { value: 'ADMIN', label: 'Court owners' },
]

const STATUS_OPTIONS: Array<{ value: UserStatus | ''; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'LOCKED', label: 'Locked' },
  { value: 'PENDING_APPROVAL', label: 'Pending approval' },
  { value: 'INACTIVE', label: 'Inactive' },
]

function statusMeta(status: UserStatus) {
  const map: Record<UserStatus, { label: string; cls: string }> = {
    ACTIVE: { label: 'Active', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
    LOCKED: { label: 'Locked', cls: 'bg-slate-100 text-slate-600 ring-slate-200' },
    PENDING_APPROVAL: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 ring-amber-100' },
    INACTIVE: { label: 'Inactive', cls: 'bg-red-50 text-red-700 ring-red-100' },
  }
  return map[status]
}

function roleLabel(role: UserRole) {
  if (role === 'ADMIN') return 'Court owner'
  if (role === 'CUSTOMER') return 'Customer'
  return role
}

function StatusBadge({ status }: { status: UserStatus }) {
  const meta = statusMeta(status)
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-[12px] font-bold ring-1 ${meta.cls}`}>
      {meta.label}
    </span>
  )
}

function UserAvatar({ user }: { user: UserAdminItem }) {
  const source = user.fullName || user.email
  const initials = source
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-50 text-sm font-extrabold text-emerald-700">
      {initials}
    </div>
  )
}

function LockDialog({
  user,
  busy,
  onClose,
  onConfirm,
}: {
  user: UserAdminItem
  busy: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
}) {
  const [reason, setReason] = useState('')
  const trimmed = reason.trim()

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-4">
      <div className="w-full max-w-md rounded-[20px] bg-white p-6 shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-red-50 text-red-600">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-extrabold text-slate-900">Lock Account</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">{user.fullName || user.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="mt-5 block">
          <span className="text-sm font-bold text-slate-700">Lock reason</span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="mt-2 h-28 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
            maxLength={500}
            placeholder="Enter the reason for locking this account..."
          />
        </label>
        <div className="mt-2 flex justify-between text-[12px] font-medium text-slate-400">
          <span>Reason is required</span>
          <span>{trimmed.length}/500</span>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(trimmed)}
            disabled={busy || trimmed.length === 0}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Locking...' : 'Confirm Lock'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function UserManagementPage() {
  const [role, setRole] = useState<ManagedRole | ''>('')
  const [status, setStatus] = useState<UserStatus | ''>('')
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [lockingUser, setLockingUser] = useState<UserAdminItem | null>(null)
  const [toast, setToast] = useState('')

  const query = useUserManagement({ role, status, page, size: 10 })
  const lockMutation = useLockUser()
  const unlockMutation = useUnlockUser()
  const pageData = query.data
  const users = pageData?.content ?? []
  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return users
    return users.filter((user) => {
      return (
        user.email.toLowerCase().includes(keyword) ||
        (user.fullName ?? '').toLowerCase().includes(keyword) ||
        (user.phone ?? '').toLowerCase().includes(keyword)
      )
    })
  }, [users, search])

  function resetAndSetRole(value: ManagedRole | '') {
    setRole(value)
    setPage(0)
  }

  function resetAndSetStatus(value: UserStatus | '') {
    setStatus(value)
    setPage(0)
  }

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2500)
  }

  function handleLock(reason: string) {
    if (!lockingUser) return
    lockMutation.mutate(
      { id: lockingUser.id, reason },
      {
        onSuccess: () => {
          showToast('Account locked')
          setLockingUser(null)
        },
      },
    )
  }

  function handleUnlock(user: UserAdminItem) {
    unlockMutation.mutate(user.id, {
      onSuccess: () => showToast('Account unlocked'),
    })
  }

  const totalPages = pageData?.totalPages ?? 0
  const totalElements = pageData?.totalElements ?? 0

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-xl">
          <Check className="h-4 w-4 text-emerald-400" />
          {toast}
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-[12px] font-bold uppercase tracking-widest text-slate-400">
              Account Management
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">System Users</h1>
          </div>
          <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm ring-1 ring-slate-100">
            <div className="text-[12px] font-bold uppercase tracking-wide text-slate-400">Total Results</div>
            <div className="text-2xl font-extrabold text-slate-900">{totalElements}</div>
          </div>
        </div>

        <div className="rounded-[20px] bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.05)] ring-1 ring-slate-100">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                placeholder="Search by name, email, or phone"
              />
            </label>
            <select
              value={role}
              onChange={(event) => resetAndSetRole(event.target.value as ManagedRole | '')}
              className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(event) => resetAndSetStatus(event.target.value as UserStatus | '')}
              className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.05)] ring-1 ring-slate-100">
          {query.isLoading ? (
            <div className="grid place-items-center px-6 py-16 text-sm font-semibold text-slate-500">
              Loading accounts...
            </div>
          ) : query.isError ? (
            <div className="grid place-items-center px-6 py-16 text-sm font-semibold text-red-600">
              Unable to load accounts.
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="grid place-items-center px-6 py-16 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Users className="h-7 w-7" />
              </div>
              <div className="mt-4 text-sm font-bold text-slate-700">No matching accounts found.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                    <th className="px-6 py-4 font-bold">Account</th>
                    <th className="px-6 py-4 font-bold">Contact</th>
                    <th className="px-6 py-4 font-bold">Role</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={user} />
                          <div className="min-w-0">
                            <div className="truncate font-extrabold text-slate-900">{user.fullName || user.email}</div>
                            <div className="mt-1 truncate text-[12px] font-medium text-slate-400">
                              Created {new Date(user.createdAt).toLocaleDateString('en-US')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 font-semibold text-slate-700">
                          <Mail className="h-4 w-4 text-slate-300" />
                          {user.email}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[12px] font-medium text-slate-400">
                          <Phone className="h-3.5 w-3.5" />
                          {user.phone || 'No phone number'}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700">{roleLabel(user.role)}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {user.status === 'LOCKED' ? (
                            <button
                              type="button"
                              onClick={() => handleUnlock(user)}
                              disabled={unlockMutation.isPending}
                              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-[12px] font-extrabold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                            >
                              <UnlockKeyhole className="h-4 w-4" />
                              Unlock
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setLockingUser(user)}
                              disabled={lockMutation.isPending || user.status === 'INACTIVE'}
                              className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3.5 py-2 text-[12px] font-extrabold text-red-700 ring-1 ring-red-100 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <LockKeyhole className="h-4 w-4" />
                              Lock
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-400">
            Page {totalPages === 0 ? 0 : page + 1} / {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((value) => Math.max(0, value - 1))}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((value) => value + 1)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

      {lockingUser && (
        <LockDialog
          user={lockingUser}
          busy={lockMutation.isPending}
          onClose={() => setLockingUser(null)}
          onConfirm={handleLock}
        />
      )}
    </div>
  )
}
