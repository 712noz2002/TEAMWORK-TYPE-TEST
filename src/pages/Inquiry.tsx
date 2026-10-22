import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, IconChatDots, IconClockCheck, IconPhone } from '../components/Icons'
import { InfoSheet } from '../components/Sheet'
import { FAQ, FAQ_MORE, INQUIRY_SUMMARY, PATIENT, PATIENT_LOCATION } from '../data/mock'

export default function Inquiry() {
  const navigate = useNavigate()
  const [sheet, setSheet] = useState<null | 'call' | 'faq' | 'more'>(null)
  const [faq, setFaq] = useState<{ q: string; a: string } | null>(null)

  return (
    <main className="page inquiry">
      <div className="inq-top">
        <div>
          <p className="inq-top__name">
            {PATIENT.name} <small>님</small>
          </p>
          <p className="inq-top__loc">{PATIENT_LOCATION}</p>
        </div>
        <button type="button" className="inq-call pressable" aria-label="병원에 전화하기" onClick={() => setSheet('call')}>
          <IconPhone size={20} />
        </button>
      </div>

      <button type="button" className="inq-main pressable" onClick={() => navigate('/inquiry/new')}>
        <img className="inq-main__icon" src="/images/icon-inquiry.png" alt="" width={58} height={58} draggable={false} />
        <span className="inq-main__text">
          <span className="inq-main__title">문의하기</span>
          <span className="inq-main__desc">
            궁금한 점을 편하게 남기고,
            <br />
            병원에 확인을 요청할 수 있어요.
          </span>
        </span>
        <ChevronRight className="inq-main__chev" size={20} stroke={2} />
      </button>

      <div className="inq-cards">
        <button type="button" className="inq-card pressable" onClick={() => navigate('/inquiry/ongoing')}>
          <IconChatDots className="inq-card__icon" size={38} stroke={1.6} />
          <span className="inq-card__title">진행중인 문의</span>
          <span className="inq-card__meta">
            <b>{INQUIRY_SUMMARY.ongoingCount}</b>
            <span>{INQUIRY_SUMMARY.ongoingLabel}</span>
          </span>
          <ChevronRight className="inq-card__chev" size={20} stroke={1.8} />
        </button>
        <button type="button" className="inq-card pressable" onClick={() => navigate('/inquiry/history')}>
          <IconClockCheck className="inq-card__icon" size={38} stroke={1.7} />
          <span className="inq-card__title">지난 문의기록</span>
          <span className="inq-card__meta">
            <span>최근 답변</span>
            <b>{INQUIRY_SUMMARY.recentCount}</b>
          </span>
          <ChevronRight className="inq-card__chev" size={20} stroke={1.8} />
        </button>
      </div>

      <div className="faq-head">
        <h2>자주 묻는 질문</h2>
        <button type="button" className="faq-more" onClick={() => setSheet('more')}>
          더보기
        </button>
      </div>
      <ul className="faq-list">
        {FAQ.map((f, i) => (
          <li key={i}>
            <button
              type="button"
              className="faq-item pressable"
              onClick={() => {
                setFaq(f)
                setSheet('faq')
              }}
            >
              <span>{f.q}</span>
              <ChevronRight size={14} stroke={1.6} />
            </button>
          </li>
        ))}
      </ul>

      <InfoSheet open={sheet === 'faq'} onClose={() => setSheet(null)} title={faq?.q ?? ''}>
        <p className="sheet__text">{faq?.a}</p>
      </InfoSheet>

      <InfoSheet open={sheet === 'more'} onClose={() => setSheet(null)} title="자주 묻는 질문">
        <ul className="sheet-faq">
          {[...FAQ, ...FAQ_MORE].map((f, i) => (
            <li key={i}>
              <p className="sheet-faq__q">{f.q}</p>
              <p className="sheet-faq__a">{f.a}</p>
            </li>
          ))}
        </ul>
      </InfoSheet>

      <InfoSheet open={sheet === 'call'} onClose={() => setSheet(null)} title="병동 간호사실 연결">
        <p className="sheet__text">
          {PATIENT.hospital} {PATIENT.ward.split(' ')[0]} 간호사실로 연결돼요.
          <br />
          통화 내용은 문의 기록에 자동으로 정리돼요.
        </p>
        <p className="sheet__note">시연용 프로토타입에서는 실제 전화가 연결되지 않아요.</p>
      </InfoSheet>
    </main>
  )
}
