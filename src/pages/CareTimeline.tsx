import { useParams } from 'react-router-dom'
import { CareIcon } from '../components/Bits'
import PageHeader from '../components/PageHeader'
import { CARE_PERIODS, careDay, careToday, type AreaKey } from '../data/careDays'
import { lastRecordDay, type CareKind } from '../data/mock'

/**
 * 돌봄 타임라인 (IMAGE 05)
 * - 홈 '오늘의 돌봄' 카드 → 오늘 날짜 (/record/timeline/YYYY-MM-DD)
 * - 기록 카드의 '오늘의 돌봄 흐름 살펴보기'는 이 페이지로 이동하지 않고, 카드가 위로 올라가며
 *   같은 목록(TimelineList)이 기록 화면 안에서 펼쳐집니다 (pages/Record.tsx)
 */
export default function CareTimeline() {
  const params = useParams()
  const valid = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) && params.date <= lastRecordDay()
  const date = valid ? params.date! : careToday()
  return (
    <main className="page care-tl">
      <PageHeader title="돌봄 타임라인" fallback="/record" />
      <TimelineList date={date} />
    </main>
  )
}

const KIND: Record<AreaKey, CareKind> = { meal: 'meal', activity: 'activity', toilet: 'excretion', hygiene: 'hygiene' }

/** 돌봄 타임라인 목록 — 타임라인 페이지와 기록 카드 펼침 화면에서 함께 사용 */
export function TimelineList({ date }: { date: string }) {
  const rows = careDay(date)?.timeline ?? []
  const groups = CARE_PERIODS.map((p) => ({ p, rows: rows.filter((r) => r.period === p.key) }))
  const shown = rows.length ? groups.filter((g) => g.rows.length) : groups.slice(0, 4)
  return (
    <ol className="care-tl__list">
      {shown.map(({ p, rows }) => (
        <li key={p.key} className="care-tl__section">
          <span className="care-tl__dot" aria-hidden="true" />
          <p className="care-tl__title">{p.label}</p>
          <p className="care-tl__range">{p.time}</p>
          {rows.length === 0 ? (
            <div className="care-tl__card is-empty">
              <p className="care-tl__sub">아직 기록 전이에요</p>
            </div>
          ) : (
            rows.map((r, i) => (
              <div key={i} className={`care-tl__card${r.watch ? ' is-watch' : ''}`}>
                <span className="care-tl__icon">
                  <CareIcon kind={KIND[r.area]} size={21} />
                </span>
                <div className="care-tl__text">
                  <p className="care-tl__name">{r.title}</p>
                  <p className="care-tl__sub">{r.detail}</p>
                </div>
                <span className="care-tl__time">{r.at} 기록</span>
              </div>
            ))
          )}
        </li>
      ))}
    </ol>
  )
}
