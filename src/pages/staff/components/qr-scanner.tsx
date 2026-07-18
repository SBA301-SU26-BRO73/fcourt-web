import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/library'

interface QrScannerProps {
  active: boolean
  onDecode: (text: string) => void
}

/**
 * Live camera QR reader. Calls `onDecode` once with the first code found.
 * Pass a stable `onDecode` (useCallback) so the camera isn't torn down on every
 * render. Falls back to a message when the camera is unavailable — manual entry
 * still works.
 */
export function QrScanner({ active, onDecode }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)

  useEffect(() => {
    if (!active) return
    const video = videoRef.current
    if (!video) return

    const reader = new BrowserMultiFormatReader()
    let stopped = false

    reader
      .decodeFromVideoDevice(null, video, (result) => {
        if (result && !stopped) {
          stopped = true
          onDecode(result.getText())
        }
      })
      .catch(() => {
        setCameraError('Camera unavailable — use the code field instead.')
      })

    return () => {
      stopped = true
      reader.reset()
    }
  }, [active, onDecode])

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-900">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        muted
        playsInline
      />

      {/* Aiming frame */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-3/5 w-3/5 -translate-x-1/2 -translate-y-1/2">
        <span className="absolute left-0 top-0 h-9 w-9 rounded-tl-xl border-l-[3px] border-t-[3px] border-green-500" />
        <span className="absolute right-0 top-0 h-9 w-9 rounded-tr-xl border-r-[3px] border-t-[3px] border-green-500" />
        <span className="absolute bottom-0 left-0 h-9 w-9 rounded-bl-xl border-b-[3px] border-l-[3px] border-green-500" />
        <span className="absolute bottom-0 right-0 h-9 w-9 rounded-br-xl border-b-[3px] border-r-[3px] border-green-500" />
        {active && !cameraError && (
          <span className="absolute inset-x-0 top-1/2 h-px animate-pulse bg-green-400" />
        )}
      </div>

      {/* Hint / error */}
      {cameraError ? (
        <div className="absolute inset-x-0 bottom-0 bg-rose-600/90 px-4 py-3 text-center text-xs font-medium text-white">
          {cameraError}
        </div>
      ) : (
        <div className="absolute inset-x-0 bottom-0 px-4 py-3 text-center font-mono text-[11px] uppercase tracking-widest text-white/80">
          Scanning… hold code inside the frame
        </div>
      )}
    </div>
  )
}
