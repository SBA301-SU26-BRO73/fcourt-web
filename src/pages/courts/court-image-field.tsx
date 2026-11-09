import { ZoomableImage } from '@/components/ui/image-viewer'
import { ImagePlus, Trash2, Undo2 } from 'lucide-react'
import { useEffect, useId, useMemo } from 'react'

type CourtImageFieldProps = {
  /** Photo currently saved on the court, if any. */
  currentUrl: string
  /** File picked but not uploaded yet (it uploads after the court is saved). */
  file: File | null
  /** The saved photo will be deleted when the form is saved. */
  removed: boolean
  error?: string
  disabled?: boolean
  onSelect: (file: File) => void
  onClearSelection: () => void
  onRemoveCurrent: () => void
  onUndoRemove: () => void
}

/** Court photo: shows the current image, lets the owner pick a replacement or remove it. */
export function CourtImageField({
  currentUrl,
  file,
  removed,
  error,
  disabled,
  onSelect,
  onClearSelection,
  onRemoveCurrent,
  onUndoRemove,
}: CourtImageFieldProps) {
  const inputId = useId()
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview)
  }, [preview])

  const shown = preview ?? (removed ? '' : currentUrl)
  const hasSaved = Boolean(currentUrl) && !removed

  return (
    <div className="space-y-2 md:col-span-2">
      <span className="text-sm font-semibold text-slate-700">Ảnh sân</span>
      <div className="flex flex-wrap items-start gap-4">
        <div className="h-32 w-48 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          {shown ? (
            <ZoomableImage src={shown} alt="Ảnh sân" buttonClassName="block h-full w-full cursor-zoom-in" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center px-2 text-center text-xs text-slate-500">
              {removed ? 'Ảnh sẽ bị xóa khi lưu' : 'Chưa có ảnh'}
            </div>
          )}
        </div>
        <div className="flex flex-col items-start gap-2">
          <label
            htmlFor={inputId}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-bold text-[#059669] hover:bg-emerald-50 ${
              disabled ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            <ImagePlus className="size-4" aria-hidden="true" />
            {hasSaved || file ? 'Đổi ảnh' : 'Tải ảnh lên'}
          </label>
          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={disabled}
            onChange={(event) => {
              const picked = event.target.files?.[0]
              if (picked) onSelect(picked)
              event.target.value = ''
            }}
          />
          {file && (
            <button type="button" disabled={disabled} onClick={onClearSelection} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900">
              <Undo2 className="size-4" aria-hidden="true" />
              Bỏ ảnh vừa chọn
            </button>
          )}
          {!file && hasSaved && (
            <button type="button" disabled={disabled} onClick={onRemoveCurrent} className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700">
              <Trash2 className="size-4" aria-hidden="true" />
              Xóa ảnh
            </button>
          )}
          {!file && removed && (
            <button type="button" disabled={disabled} onClick={onUndoRemove} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900">
              <Undo2 className="size-4" aria-hidden="true" />
              Giữ lại ảnh cũ
            </button>
          )}
          <span className="block text-xs text-slate-500">JPEG, PNG hoặc WebP, tối đa 5 MB. Ảnh được tải lên khi bạn lưu sân.</span>
        </div>
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
