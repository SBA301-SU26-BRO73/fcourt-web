import * as React from "react";

const toneClasses = {
  green: 'bg-green-100 text-green-800',
  gray: 'bg-slate-100 text-slate-600',
  red: 'bg-red-100 text-red-700',
  amber: 'bg-amber-100 text-amber-800',
} as const

const dotClasses = {
  green: 'bg-green-500',
  gray: 'bg-slate-400',
  red: 'bg-red-500',
  amber: 'bg-amber-500',
} as const

type Tone = keyof typeof toneClasses

interface BadgeProps {
  tone?: Tone
  children: React.ReactNode
}

export function Badge({ tone = 'gray', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide ${toneClasses[tone]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClasses[tone]}`} />
      {children}
    </span>
  )
}
