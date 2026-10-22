const WEEK = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

/** 'YYYY-MM-DD' ↔ Date (로컬 시간, 시간대 영향 없음) */
export function parseISO(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export function toISO(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
/** 오늘 날짜 (기기 시간 기준, 'YYYY-MM-DD') */
export function todayISO() {
  return toISO(new Date())
}

export function addDays(iso: string, n: number) {
  const d = parseISO(iso)
  d.setDate(d.getDate() + n)
  return toISO(d)
}
export function weekdayKo(iso: string) {
  return WEEK[parseISO(iso).getDay()]
}
export function monthDayKo(iso: string) {
  const d = parseISO(iso)
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

/** 달력 6주(42칸) — 앞뒤 달 날짜 포함 */
export function monthMatrix(year: number, month: number) {
  const first = new Date(year, month, 1)
  const start = new Date(year, month, 1 - first.getDay())
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    return { iso: toISO(d), day: d.getDate(), inMonth: d.getMonth() === month }
  })
}
