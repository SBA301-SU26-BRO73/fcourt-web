export function formatTime(value: string) {
  return value.slice(0, 5)
}

export function formatMoney(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`
}
