import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { StatusBadge } from '../components/Bits'
import { INQUIRY_STEPS, ONGOING } from '../data/mock'

export default function InquiryOngoing() {
  const navigate = useNavigate()
  return (
    <main className="page ongoing">
      <PageHeader title="진행중인 문의" fallback="/inquiry" />
      <p className="ongoing__intro">병원에서 확인하고 있거나 답변을 기다리는 문의예요.</p>
      <ul className="ongoing__list">
        {ONGOING.map((q) => (
          <li key={q.id}>
            <button type="button" className="ongoing-card pressable" onClick={() => navigate(`/inquiry/timeline/${q.timelineId}`)}>
              <span className="ongoing-card__head">
                <span className="ongoing-card__title">{q.title}</span>
                <StatusBadge status={q.status} />
              </span>
              <span className="ongoing-card__date">{q.date}</span>
              <span className="stepper" aria-label={`현재 단계: ${INQUIRY_STEPS[q.current]}`}>
                <span className="stepper__line" />
                {INQUIRY_STEPS.map((s, i) => (
                  <span key={s} className="stepper__step">
                    <span className={`stepper__dot ${i < q.current ? 'is-done' : i === q.current ? 'is-current' : 'is-todo'}`} />
                    <span className={`stepper__label${i === q.highlightLabel ? ' is-on' : ''}`}>{s}</span>
                  </span>
                ))}
              </span>
              <span className="ongoing-card__update">
                최근 업데이트 <b>{q.lastLabel}</b> <b>{q.lastTime}</b>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
