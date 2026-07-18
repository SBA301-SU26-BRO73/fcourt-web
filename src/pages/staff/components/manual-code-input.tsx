import { useState, type FormEvent } from 'react'
import { Keyboard } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface ManualCodeInputProps {
  onSubmit: (code: string) => void
  disabled?: boolean
}

export function ManualCodeInput({ onSubmit, disabled }: ManualCodeInputProps) {
  const [value, setValue] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const code = value.trim()
    if (code) onSubmit(code)
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-2 flex items-center gap-1.5 text-[12.5px] font-medium text-slate-500">
        <Keyboard size={14} />
        Or enter the booking code manually
      </div>
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Paste booking code"
          disabled={disabled}
          className="h-12 flex-1 rounded-lg border border-slate-200 bg-white px-4 font-mono text-sm tracking-wide outline-none focus:border-green-500 disabled:opacity-50"
        />
        <Button
          type="submit"
          variant="primary"
          disabled={disabled || !value.trim()}
          className="h-12 px-5"
        >
          Find
        </Button>
      </form>
      <p className="mt-2 text-[11.5px] text-slate-400">
        The code is on the customer&apos;s confirmation (a UUID like
        <span className="font-mono"> 550e8400-…</span>).
      </p>
    </div>
  )
}
