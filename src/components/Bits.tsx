import type { ReactNode } from 'react'
import type { CareKind, InquiryStatus } from '../data/mock'
import { IconActivity, IconToilet, IconUtensils, IconWasher, LogoMark } from './Icons'

/** 돌봄 종류별 아이콘 (식사 / 활동 / 배설 / 위생) */
export function CareIcon({ kind, size = 24 }: { kind: CareKind; size?: number }) {
  const s = { size, stroke: 1.6 }
  if (kind === 'meal') return <IconUtensils {...s} />
  if (kind === 'activity') return <IconActivity {...s} />
  if (kind === 'excretion') return <IconToilet {...s} />
  return <IconWasher {...s} />
}

/** 필터 칩 (전체 / 진료 / 면회 등) */
export function Chips<T extends string>({
  items,
  value,
  onChange,
  className = '',
}: {
  items: readonly T[]
  value: T
  onChange: (v: T) => void
  className?: string
}) {
  return (
    <div className={`chips ${className}`} role="tablist">
      {items.map((it) => (
        <button
          key={it}
          type="button"
          role="tab"
          aria-selected={value === it}
          className={`chip${value === it ? ' is-active' : ''}`}
          onClick={() => onChange(it)}
        >
          {it}
        </button>
      ))}
    </div>
  )
}

const BADGE_CLASS: Record<InquiryStatus, string> = {
  답변대기: 'badge--wait',
  확인중: 'badge--checking',
  '답변 완료': 'badge--done',
}

export function StatusBadge({ status }: { status: InquiryStatus }) {
  return <span className={`badge ${BADGE_CLASS[status]}`}>{status}</span>
}

/** 연회색 원 안의 안심ON 심볼 */
export function LogoBadge({ size = 34, mark = 26 }: { size?: number; mark?: number }) {
  return (
    <span className="logo-badge" style={{ width: size, height: size }}>
      <LogoMark size={mark} />
    </span>
  )
}

/** 줄바꿈(\n)을 그대로 보여주는 텍스트 */
export function Lines({ text }: { text: string }): ReactNode {
  const parts = text.split('\n')
  return parts.map((p, i) => (
    <span key={i}>
      {p}
      {i < parts.length - 1 && <br />}
    </span>
  ))
}
