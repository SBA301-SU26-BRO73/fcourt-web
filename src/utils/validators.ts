export const validators = {
  email: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  phone: (v: string) => /^(0|\+84)\d{8,10}$/.test(v.replace(/[\s.]/g, '')),
  passwordStrength: (pw: string): 0 | 1 | 2 | 3 | 4 => {
    let s = 0
    if (pw.length >= 6) s++
    if (pw.length >= 10) s++
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
    if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++
    return Math.min(s, 4) as 0 | 1 | 2 | 3 | 4
  },
}
