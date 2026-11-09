import { ZoomableImage } from '@/components/ui/image-viewer'
import { ImagePlus, Trash2 } from 'lucide-react'
import { useEffect, useId, useMemo, useRef } from 'react'

import type { BranchImage } from '@/types/branch'
import { GALLERY_MAX_IMAGES } from './branch-form.utils'

type BranchGalleryProps = {
  existing: BranchImage[]
  staged: File[]
  error?: string
  disabled?: boolean
  onAddFiles: (files: File[]) => void
  onRemoveStaged: (index: number) => void
  onDeleteExisting: (image: BranchImage) => void
}

/** Gallery images of a branch: saved ones come from the server, staged ones upload after the branch is saved. */
export function BranchGallery({
  existing,
  staged,
  error,
  disabled,
  onAddFiles,
  onRemoveStaged,
  onDeleteExisting,
}: BranchGalleryProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const previews = useMemo(
    () => staged.map((file) => URL.createObjectURL(file)),
    [staged],
  )
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews])

  const total = existing.length + staged.length

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Thư viện ảnh</h2>
          <p className="mt-1 text-sm text-slate-500">
            Ảnh JPEG, PNG hoặc WebP, tối đa 5 MB mỗi ảnh, {GALLERY_MAX_IMAGES} ảnh mỗi chi nhánh ({total}/{GALLERY_MAX_IMAGES}).
          </p>
        </div>
        <label
          htmlFor={inputId}
          className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-bold text-[#059669] hover:bg-emerald-50 ${
            disabled || total >= GALLERY_MAX_IMAGES ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          <ImagePlus className="size-4" aria-hidden="true" />
          Thêm ảnh
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => {
            onAddFiles(Array.from(event.target.files ?? []))
            event.target.value = ''
          }}
        />
      </div>

      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}

      {total === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
          Chưa có ảnh nào.
        </p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {existing.map((image, index) => (
            <li key={image.id} className="relative overflow-hidden rounded-xl bg-slate-100">
              <ZoomableImage
                src={image.url}
                alt="Ảnh chi nhánh"
                gallery={existing.map((item, i) => ({ url: item.url, alt: `Ảnh chi nhánh ${i + 1}` }))}
                index={index}
                buttonClassName="block w-full cursor-zoom-in"
                className="h-28 w-full object-cover"
              />
              <button
                type="button"
                aria-label="Xóa ảnh"
                disabled={disabled}
                onClick={() => onDeleteExisting(image)}
                className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white/90 text-red-600 shadow hover:bg-red-50 disabled:opacity-40"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
          {staged.map((file, index) => (
            <li key={`${file.name}-${index}`} className="relative overflow-hidden rounded-xl bg-slate-100 ring-2 ring-emerald-200">
              <img src={previews[index]} alt={file.name} className="h-28 w-full object-cover" />
              <span className="absolute bottom-1 left-1 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">Mới</span>
              <button
                type="button"
                aria-label={`Bỏ ảnh ${file.name}`}
                disabled={disabled}
                onClick={() => onRemoveStaged(index)}
                className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white/90 text-red-600 shadow hover:bg-red-50 disabled:opacity-40"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
