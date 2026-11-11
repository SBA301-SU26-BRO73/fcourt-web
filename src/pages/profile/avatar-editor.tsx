import { Camera, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'

import { getApiErrorMessage } from '@/common/utils/api-error'
import { removeAvatar, uploadAvatar } from '@/services/auth/auth.service'
import type { UserProfile } from '@/types/auth'

import { validateAvatarFile } from './avatar.utils'

interface AvatarEditorProps {
  avatarUrl: string | null | undefined
  initials: string
  onChanged: (profile: UserProfile, message: string) => void
}

export function AvatarEditor({ avatarUrl, initials, onChanged }: AvatarEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function run(action: () => Promise<UserProfile>, message: string) {
    setBusy(true)
    setError('')
    try {
      onChanged(await action(), message)
    } catch (e) {
      setError(getApiErrorMessage(e, 'Không thể cập nhật ảnh đại diện.'))
    } finally {
      setBusy(false)
    }
  }

  function onPick(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0]
    ev.target.value = ''
    if (!file) return
    const problem = validateAvatarFile(file)
    if (problem) { setError(problem); return }
    void run(() => uploadAvatar(file), 'Cập nhật ảnh đại diện thành công!')
  }

  return (
    <div className="relative z-10">
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-green-600 text-xl font-extrabold text-white shadow-md">
        {avatarUrl ? <img src={avatarUrl} alt="Ảnh đại diện" className="h-full w-full object-cover" /> : initials}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" aria-label="Chọn ảnh đại diện" onChange={onPick} />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        aria-label="Đổi ảnh đại diện"
        className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:text-green-700 disabled:opacity-60"
      >
        {busy ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Camera size={14} />}
      </button>
      {avatarUrl && (
        <button
          type="button"
          disabled={busy}
          onClick={() => void run(removeAvatar, 'Đã xóa ảnh đại diện.')}
          aria-label="Xóa ảnh đại diện"
          className="absolute -bottom-1 -left-1 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:text-red-600 disabled:opacity-60"
        >
          <Trash2 size={14} />
        </button>
      )}
      {error && <p role="alert" className="absolute left-0 top-[4.5rem] w-56 text-xs text-red-600">{error}</p>}
    </div>
  )
}
