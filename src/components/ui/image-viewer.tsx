import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, Download, X, ZoomIn, ZoomOut } from 'lucide-react'

export interface ViewerItem {
  url: string
  alt?: string
  /** Force the kind; by default a `.pdf` path (query string ignored) is a PDF, everything else an image. */
  kind?: 'image' | 'pdf'
}

export function isPdfUrl(url: string) {
  try {
    return new URL(url, 'http://x').pathname.toLowerCase().endsWith('.pdf')
  } catch {
    return /\.pdf($|\?)/i.test(url)
  }
}

const kindOf = (item: ViewerItem) => item.kind ?? (isPdfUrl(item.url) ? 'pdf' : 'image')

const ZOOM_STEPS = [1, 1.5, 2, 3, 4]

interface ImageViewerProps {
  items: ViewerItem[]
  index: number
  onIndexChange: (index: number) => void
  onClose: () => void
}

/** Full-page lightbox: fit-to-screen image, zoom, prev/next, close on Esc or backdrop. PDFs render in an iframe. */
export function ImageViewer({ items, index, onIndexChange, onClose }: ImageViewerProps) {
  const [zoom, setZoom] = useState(0)
  const [failed, setFailed] = useState(false)
  const current = items[index]
  const count = items.length

  const go = useCallback(
    (delta: number) => {
      if (count < 2) return
      setZoom(0)
      setFailed(false)
      onIndexChange((index + delta + count) % count)
    },
    [count, index, onIndexChange],
  )

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
      } else if (event.key === 'ArrowLeft') go(-1)
      else if (event.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey, true)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey, true)
      document.body.style.overflow = overflow
    }
  }, [go, onClose])

  if (!current) return null
  const pdf = kindOf(current) === 'pdf'
  const scale = ZOOM_STEPS[zoom]
  const btn =
    'grid size-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25 disabled:opacity-30'

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={current.alt ?? 'Xem ảnh'}
      className="fixed inset-0 z-[100] flex flex-col bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-white" onClick={(e) => e.stopPropagation()}>
        <div className="min-w-0 truncate text-sm font-medium">
          {current.alt}
          {count > 1 && <span className="ml-2 text-white/60">{index + 1} / {count}</span>}
        </div>
        <div className="flex items-center gap-2">
          {!pdf && (
            <>
              <button type="button" aria-label="Thu nhỏ" className={btn} disabled={zoom === 0} onClick={() => setZoom((z) => Math.max(0, z - 1))}>
                <ZoomOut className="size-5" />
              </button>
              <button type="button" aria-label="Phóng to" className={btn} disabled={zoom === ZOOM_STEPS.length - 1} onClick={() => setZoom((z) => Math.min(ZOOM_STEPS.length - 1, z + 1))}>
                <ZoomIn className="size-5" />
              </button>
            </>
          )}
          <a href={current.url} download target="_blank" rel="noopener noreferrer" aria-label="Tải xuống" className={btn}>
            <Download className="size-5" />
          </a>
          <button type="button" aria-label="Đóng" className={btn} onClick={onClose} autoFocus>
            <X className="size-5" />
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center">
        {count > 1 && (
          <button type="button" aria-label="Ảnh trước" className={`${btn} absolute left-3 z-10`} onClick={(e) => { e.stopPropagation(); go(-1) }}>
            <ChevronLeft className="size-6" />
          </button>
        )}
        {pdf ? (
          <iframe
            key={current.url}
            title={current.alt ?? 'Tệp PDF'}
            src={current.url}
            className="h-full w-full max-w-5xl rounded-lg bg-white"
            onClick={(e) => e.stopPropagation()}
          />
        ) : failed ? (
          <p className="rounded-lg bg-white/10 px-4 py-3 text-sm text-white" onClick={(e) => e.stopPropagation()}>
            Không tải được ảnh. Liên kết có thể đã hết hạn, hãy tải lại trang.
          </p>
        ) : (
          <div className="flex h-full w-full items-center justify-center overflow-auto p-4">
            <img
              key={current.url}
              src={current.url}
              alt={current.alt ?? ''}
              onClick={(e) => { e.stopPropagation(); setZoom((z) => (z + 1) % ZOOM_STEPS.length) }}
              onError={() => setFailed(true)}
              style={scale === 1 ? undefined : { width: `${scale * 100}%`, maxWidth: 'none', maxHeight: 'none' }}
              className={`m-auto select-none rounded-lg object-contain ${scale === 1 ? 'max-h-full max-w-full cursor-zoom-in' : 'cursor-zoom-out'}`}
            />
          </div>
        )}
        {count > 1 && (
          <button type="button" aria-label="Ảnh sau" className={`${btn} absolute right-3 z-10`} onClick={(e) => { e.stopPropagation(); go(1) }}>
            <ChevronRight className="size-6" />
          </button>
        )}
      </div>
    </div>,
    document.body,
  )
}

/**
 * `const { open, viewer } = useImageViewer()`: render `{viewer}` once, call `open(items, startIndex)` from a click.
 */
export function useImageViewer() {
  const [state, setState] = useState<{ items: ViewerItem[]; index: number } | null>(null)
  const open = useCallback((items: ViewerItem[], index = 0) => {
    if (items.length > 0) setState({ items, index })
  }, [])
  const close = useCallback(() => setState(null), [])
  const viewer: ReactNode = state && (
    <ImageViewer
      items={state.items}
      index={state.index}
      onIndexChange={(index) => setState((s) => s && { ...s, index })}
      onClose={close}
    />
  )
  return { open, viewer }
}

interface ViewerButtonProps {
  /** Items shown in the viewer; defaults to just `url`. */
  items?: ViewerItem[]
  /** Start position inside `items`. */
  index?: number
  url?: string
  alt?: string
  className?: string
  children: ReactNode
}

/** A button (text link look is up to `className`) that opens the in-page viewer instead of a new tab. */
export function ViewerButton({ items, index = 0, url, alt, className, children }: ViewerButtonProps) {
  const { open, viewer } = useImageViewer()
  const list = items ?? (url ? [{ url, alt }] : [])
  return (
    <>
      <button type="button" className={className} aria-label={alt} onClick={() => open(list, index)}>
        {children}
      </button>
      {viewer}
    </>
  )
}

interface ZoomableImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string
  /** Wrapper button classes (the image keeps `className`). */
  buttonClassName?: string
  /** Whole gallery and the position of this image in it, for prev/next. */
  gallery?: ViewerItem[]
  index?: number
}

/** An `<img>` that opens the in-page viewer on click. */
export function ZoomableImage({ src, alt, buttonClassName, gallery, index = 0, ...img }: ZoomableImageProps) {
  const { open, viewer } = useImageViewer()
  return (
    <>
      <button
        type="button"
        aria-label={alt ? `Xem ảnh: ${alt}` : 'Xem ảnh'}
        className={buttonClassName ?? 'block cursor-zoom-in'}
        onClick={() => open(gallery ?? [{ url: src, alt }], gallery ? index : 0)}
      >
        <img src={src} alt={alt} {...img} />
      </button>
      {viewer}
    </>
  )
}
