import { useState, type ChangeEvent } from 'react'
import { ImagePlus, Loader2, Star, X } from 'lucide-react'

import { REVIEW_MAX_IMAGES, validateReviewImages } from '@/services/review/review.api'
import type { MyBooking } from '@/types/my-booking'

export interface ReviewSubmit {
  bookingId: number
  rating: number
  comment: string
  files: File[]
}

interface ReviewDialogProps {
  booking: MyBooking | null
  submitting?: boolean
  onClose: () => void
  onSubmit: (value: ReviewSubmit) => void
}

/** Review form for a COMPLETED booking: 1-5 stars, optional comment (max 2000) and up to 5 photos. */
export function ReviewDialog({ booking, submitting = false, onClose, onSubmit }: ReviewDialogProps) {
  if (!booking) return null
  return <ReviewDialogBody key={booking.id} booking={booking} submitting={submitting} onClose={onClose} onSubmit={onSubmit} />
}

function ReviewDialogBody({ booking, submitting, onClose, onSubmit }: ReviewDialogProps & { booking: MyBooking }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState<string | null>(null)

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? [])
    event.target.value = ''
    const next = [...files, ...picked]
    const error = validateReviewImages(next)
    if (error) {
      setFileError(error)
      return
    }
    setFileError(null)
    setFiles(next)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <div role="dialog" aria-label="Viết đánh giá" className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">Đánh giá trải nghiệm</h2>
          <p className="mt-1 text-sm text-slate-500">
            {booking.branchName} - {booking.courtName}
          </p>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div>
            <div className="mb-1 text-sm font-semibold text-slate-700">Chất lượng</div>
            <div className="flex gap-1" role="radiogroup" aria-label="Số sao">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={rating === value}
                  aria-label={`${value} sao`}
                  onClick={() => setRating(value)}
                  className="rounded p-1"
                >
                  <Star size={28} className={value <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
                </button>
              ))}
            </div>
          </div>

          <label className="block text-sm font-semibold text-slate-700">
            Nhận xét
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={4}
              maxLength={2000}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              placeholder="Chia sẻ trải nghiệm của bạn (không bắt buộc)"
            />
          </label>

          <div>
            <div className="mb-1 text-sm font-semibold text-slate-700">
              Ảnh ({files.length}/{REVIEW_MAX_IMAGES})
            </div>
            <div className="flex flex-wrap gap-2">
              {files.map((file, index) => (
                <div key={`${file.name}-${index}`} className="relative h-16 w-16 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-[10px] text-slate-500">
                  <span className="block truncate p-1">{file.name}</span>
                  <button
                    type="button"
                    aria-label={`Xóa ảnh ${file.name}`}
                    onClick={() => setFiles(files.filter((_, current) => current !== index))}
                    className="absolute right-0.5 top-0.5 rounded-full bg-white/90 p-0.5 text-slate-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {files.length < REVIEW_MAX_IMAGES && (
                <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-400 hover:border-emerald-500 hover:text-emerald-600">
                  <ImagePlus size={20} />
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    aria-label="Chọn ảnh đánh giá"
                    className="hidden"
                    onChange={handleFiles}
                  />
                </label>
              )}
            </div>
            {fileError && <div className="mt-1 text-xs text-red-600">{fileError}</div>}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
          >
            Đóng
          </button>
          <button
            type="button"
            disabled={submitting || rating === 0}
            onClick={() => onSubmit({ bookingId: booking.id, rating, comment, files })}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Gửi đánh giá
          </button>
        </div>
      </div>
    </div>
  )
}
