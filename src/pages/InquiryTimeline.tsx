import { Navigate, useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { Lines, LogoBadge } from '../components/Bits'
import { IconCheck } from '../components/Icons'
import { INQUIRY_TIMELINES } from '../data/mock'

export default function InquiryTimeline() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const nodes = INQUIRY_TIMELINES[id]
  if (!nodes) return <Navigate to="/inquiry" replace />

  const completed = nodes[nodes.length - 1].title === '확인 완료'

  return (
    <main className="page inq-tl">
      <PageHeader title="문의 타임라인" fallback="/inquiry" />
      <ol className={`inq-tl__list${completed ? ' is-complete' : ''}`} data-id={id}>
        {nodes.map((n, i) => {
          const last = i === nodes.length - 1
          return (
            <li key={i} className={`inq-tl__node${last ? ' is-last' : ''}`}>
              <span className={`inq-tl__dot is-${completed && last ? 'check' : n.state}`}>
                {completed && last && <IconCheck size={10} stroke={3} />}
              </span>
              <p className="inq-tl__title">{n.title}</p>
              <p className="inq-tl__date">{n.date}</p>
              {n.kind === 'card' ? (
                <div className={`inq-tl__card${n.text.includes('\n') ? ' is-multi' : ''}`}>
                  <LogoBadge size={30} mark={29} />
                  <p>
                    <Lines text={n.text} />
                  </p>
                </div>
              ) : (
                <div className="inq-tl__box">{n.text}</div>
              )}
            </li>
          )
        })}
      </ol>
      {/* IMAGE 12(답변 준비 전 문의)에는 추가 질문 버튼이 없음 */}
      {id !== 'meal-progress' && (
        <button
          type="button"
          className={`inq-tl__more pressable${completed ? ' is-primary' : ''}`}
          onClick={() => navigate('/inquiry/new')}
        >
          추가 질문하기
        </button>
      )}
    </main>
  )
}
