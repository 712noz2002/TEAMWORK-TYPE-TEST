import { useEffect } from 'react'
import { lastRecordDay, today } from '../data/mock'
import { useStoredState } from './storage'

/** 이번 앱 실행을 구분하는 값 — 앱을 새로 열거나 새로고침하면 바뀜 */
const LAUNCH = String(Date.now())

/**
 * 기록 화면에서 보고 있는 날짜
 * - 앱을 열면(새로고침 포함) 항상 오늘 = 가장 최신 날짜부터 보여줌
 * - 앱을 쓰는 동안에는 넘겨 본 날짜를 유지 (타임라인에 갔다 와도 그대로)
 * - 앱을 켜 둔 채 날짜가 바뀐 뒤 다시 돌아오면 오늘로
 */
export function useRecordDate() {
  const [state, setState] = useStoredState('record.date.v2', { date: today(), setOn: today(), launch: LAUNCH })
  const stale = state.setOn !== today() || state.launch !== LAUNCH

  useEffect(() => {
    if (stale) setState({ date: today(), setOn: today(), launch: LAUNCH })
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        setState((s) => (s.setOn !== today() ? { date: today(), setOn: today(), launch: LAUNCH } : s))
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [stale, setState])

  // 내일 이후 날짜는 볼 수 없음 (자정이 지나 기준이 바뀌어도 안전하게)
  const date = stale ? today() : state.date > lastRecordDay() ? lastRecordDay() : state.date
  const setDate = (v: string | ((d: string) => string)) =>
    setState((s) => {
      const cur = s.setOn !== today() || s.launch !== LAUNCH ? today() : s.date
      return { date: typeof v === 'function' ? v(cur) : v, setOn: today(), launch: LAUNCH }
    })
  return [date, setDate] as const
}
