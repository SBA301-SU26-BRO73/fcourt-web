import { FileText, Image, Upload, X } from 'lucide-react'
import { useState } from 'react'

interface UploadZoneProps {
  hint?: string
  accept?: string
  files: File[]
  onChange: (files: File[]) => void
}

export function UploadZone({ hint, accept, files, onChange }: UploadZoneProps) {
  const [drag, setDrag] = useState(false)

  function add(raw: FileList | null) {
    if (!raw) return
    const arr = [...raw].slice(0, 5 - files.length)
    if (arr.length) onChange([...files, ...arr])
  }

  return (
    <div>
      <label
        className={[
          'flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition',
          drag
            ? 'border-green-500 bg-green-50'
            : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100',
        ].join(' ')}
        onDragOver={(e) => {
          e.preventDefault()
          setDrag(true)
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDrag(false)
          add(e.dataTransfer.files)
        }}
      >
        <span className="text-slate-400">
          <Upload size={24} />
        </span>
        <div className="text-sm text-center text-slate-600">
          <b>Nhấn để tải lên</b> hoặc kéo thả
        </div>
        <div className="text-xs text-slate-400">{hint ?? 'PNG, JPG, PDF · Tối đa 5MB'}</div>
        <input
          type="file"
          accept={accept}
          multiple
          hidden
          onChange={(e) => {
            add(e.target.files)
            e.target.value = ''
          }}
        />
      </label>

      {files.length > 0 && (
        <div className="mt-2 space-y-2">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-white"
            >
              <span
                className={[
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                  /^image/.test(f.type)
                    ? 'bg-blue-50 text-blue-500'
                    : 'bg-orange-50 text-orange-500',
                ].join(' ')}
              >
                {/^image/.test(f.type) ? <Image size={16} /> : <FileText size={16} />}
              </span>
              <span className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800 truncate">{f.name}</div>
                <div className="text-xs text-slate-400">{(f.size / 1024).toFixed(0)} KB</div>
              </span>
              <button
                type="button"
                onClick={() => onChange(files.filter((_, j) => j !== i))}
                className="text-slate-400 hover:text-slate-600 transition flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
