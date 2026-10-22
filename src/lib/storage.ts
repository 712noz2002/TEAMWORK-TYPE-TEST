import { useCallback, useEffect, useState } from 'react'

/** LocalStorage 키 접두사 — 데모 초기화 시 이 접두사를 가진 값만 지웁니다 */
const PREFIX = 'ansimon:v1:'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw == null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* 사파리 개인정보 보호 모드 등에서는 저장하지 않음 */
  }
}

/** 화면을 이동해도 유지되는 상태 (LocalStorage) */
export function useStoredState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => read(key, fallback))

  useEffect(() => {
    write(key, value)
  }, [key, value])

  const set = useCallback((v: T | ((prev: T) => T)) => setValue(v), [])
  return [value, set] as const
}

/** 전시용 데모 초기화: 저장된 체험 기록을 모두 지우고 홈으로 */
export function resetDemo() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k))
    sessionStorage.clear()
  } catch {
    /* noop */
  }
  // 미리보기(아티팩트) 환경에서는 페이지 이동 대신 자체 초기화 훅을 사용
  const hook = (window as unknown as { __ansimonReset?: () => void }).__ansimonReset
  if (hook) hook()
  else window.location.replace('/')
}
