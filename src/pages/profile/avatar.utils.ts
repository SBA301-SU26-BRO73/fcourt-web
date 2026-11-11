const AVATAR_MAX_BYTES = 2 * 1024 * 1024

/** Returns an error message, or null when the file can be uploaded as an avatar. */
export function validateAvatarFile(file: Pick<File, 'type' | 'size'>): string | null {
  if (!file.type.startsWith('image/')) return 'Vui lòng chọn một tệp ảnh.'
  if (file.size > AVATAR_MAX_BYTES) return 'Ảnh đại diện tối đa 2 MB.'
  return null
}
