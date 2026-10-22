import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { Chips, StatusBadge } from '../components/Bits'
import { IconPeople, IconUser } from '../components/Icons'
import { HISTORY } from '../data/mock'
import { useStoredState } from '../lib/storage'

const FILTERS = ['전체', '나의 문의', '가족 문의'] as const
type Filter = (typeof FILTERS)[number]

export default function InquiryHistory() {
  const navigate = useNavigate()
  const [filter, setFilter] = useStoredState<Filter>('history.filter', '전체')
  const list = HISTORY.filter((h) => filter === '전체' || (filter === '나의 문의' ? h.owner === 'mine' : h.owner === 'family'))

  return (
    <main className="page history">
      <PageHeader title="지난 문의 기록" fallback="/inquiry" />
      <Chips items={FILTERS} value={filter} onChange={setFilter} className="history-chips" />
      <ul className="history-list">
        {list.map((h) => (
          <li key={h.id} className="history-card">
            <div className="history-card__head">
              <span className="history-card__avatar">{h.owner === 'mine' ? <IconUser size={22} stroke={1.8} /> : <IconPeople size={24} stroke={1.7} />}</span>
              <div>
                {/* 개인정보 보호: 다른 보호자의 실명은 표시하지 않음 */}
                <p className="history-card__who">{h.owner === 'mine' ? '나의 문의' : '다른 보호자의 문의'}</p>
                <p className="history-card__date">{h.date}</p>
              </div>
              <StatusBadge status={h.status} />
            </div>
            <p className="history-card__body">{h.body}</p>
            <button type="button" className="outline-btn pressable" onClick={() => navigate(`/inquiry/timeline/${h.timelineId}`)}>
              내용 확인
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
