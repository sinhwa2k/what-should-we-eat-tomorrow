const DAYS = ['일', '월', '화', '수', '목', '금', '토']

export function toISO(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function fromISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function shift(s: string, days: number): string {
  const d = fromISO(s)
  d.setDate(d.getDate() + days)
  return toISO(d)
}

export function label(s: string): string {
  const d = fromISO(s)
  return `${d.getMonth() + 1}/${d.getDate()} (${DAYS[d.getDay()]})`
}
