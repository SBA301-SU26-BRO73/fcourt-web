import { ImagePlus, Trash2, Upload } from 'lucide-react'
import { useEffect, useId, useState } from 'react'

const MAX_SIZE = 5 * 1024 * 1024

type ImageUploadFieldProps = {
  label: string
  value: string
  file: File | null
  error?: string
  onFileChange: (file: File | null) => void
  onClear: () => void
}

export function ImageUploadField({ label, value, file, error, onFileChange, onClear }: ImageUploadFieldProps) {
  const inputId = useId()
  const [dragging, setDragging] = useState(false)
  const [localError, setLocalError] = useState('')
  const [filePreviewUrl, setFilePreviewUrl] = useState('')

  useEffect(() => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setFilePreviewUrl(String(reader.result ?? ''))
    reader.readAsDataURL(file)
    return () => reader.abort()
  }, [file])

  function selectFile(nextFile?: File) {
    if (!nextFile) return
    if (!nextFile.type.startsWith('image/')) {
      setLocalError('Vui lòng chọn đúng tệp hình ảnh.')
      return
    }
    if (nextFile.size > MAX_SIZE) {
      setLocalError('Dung lượng ảnh không được vượt quá 5 MB.')
      return
    }
    setLocalError('')
    onFileChange(nextFile)
  }

  const message = localError || error
  const previewUrl = file ? filePreviewUrl : value

  return (
    <div className="space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <label
        htmlFor={inputId}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${
          dragging
            ? 'border-emerald-500 bg-emerald-50'
            : message
              ? 'border-red-300 bg-red-50'
              : 'border-slate-300 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/60'
        }`}
        onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          selectFile(event.dataTransfer.files[0])
        }}
      >
        <span className="mb-3 grid size-11 place-items-center rounded-full bg-emerald-100 text-emerald-700">
          <Upload className="size-5" />
        </span>
        <span className="text-sm font-bold text-slate-800">Nhấn để chọn ảnh hoặc kéo thả ảnh vào đây</span>
        <span className="mt-1 text-xs text-slate-500">PNG, JPG, JPEG hoặc WEBP · Tối đa 5 MB</span>
        <input
          id={inputId}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={(event) => {
            selectFile(event.target.files?.[0])
            event.target.value = ''
          }}
        />
      </label>
      {message && <p className="text-sm text-red-600">{message}</p>}

      {previewUrl && !message && (
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3">
          <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-100">
            <img src={previewUrl} alt={`Xem trước ${label.toLowerCase()}`} className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{file?.name || 'Ảnh hiện tại'}</p>
            <p className="mt-1 text-xs text-slate-500">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Chọn ảnh mới để thay thế'}</p>
          </div>
          <button
            type="button"
            onClick={() => { setLocalError(''); onClear() }}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            <Trash2 className="size-4" /> Xóa ảnh
          </button>
        </div>
      )}
      {!previewUrl && !message && (
        <p className="flex items-center gap-2 text-xs text-slate-500"><ImagePlus className="size-4" /> Chưa có ảnh được chọn.</p>
      )}
    </div>
  )
}
