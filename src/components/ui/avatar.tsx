
const COLORS = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-cyan-500',
  'bg-teal-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-rose-500',
]

function colorFor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

function initials(email: string): string {
  const local = email.split('@')[0]
  const parts = local.split(/[._-]/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return local.slice(0, 2).toUpperCase()
}

interface AvatarProps {
  email: string
  size?: number
}

export function Avatar({ email, size = 36 }: AvatarProps) {
  const color = colorFor(email)
  return (
    <div
      className={`${color} flex shrink-0 items-center justify-center rounded-full font-semibold text-white`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials(email)}
    </div>
  )
}
