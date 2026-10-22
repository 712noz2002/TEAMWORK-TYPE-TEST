import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CareIcon, Chips, Lines } from '../components/Bits'
import {
  ChevronRight,
  IconBell,
  IconCalendar,
  IconChatDots,
  IconMenu,
  IconMessages,
  IconPen,
  LogoMark,
} from '../components/Icons'
import { InfoSheet } from '../components/Sheet'
import {
  CHECK_ITEMS,
  NOTIFICATIONS,
  PATIENT,
  PATIENT_LOCATION,
  TODAY_CARE,
  todayCareDetail,
  TOGETHER_BANNER,
  type CheckItem,
} from '../data/mock'
import { resetDemo, useStoredState } from '../lib/storage'
import { today } from '../data/mock'

const FILTERS = ['전체', '진료', '면회'] as const
type Filter = (typeof FILTERS)[number]
type Tab = 'care' | 'check'

export default function Home() {
  const navigate = useNavigate()
  const [tab, setTab] = useStoredState<Tab>('home.tab', 'care')
  const [filter, setFilter] = useStoredState<Filter>('home.filter', '전체')
  const [sheet, setSheet] = useState<null | 'alarm' | 'visit' | 'menu' | 'reset' | 'detail'>(null)
  const [detail, setDetail] = useState<CheckItem | null>(null)

  // 데모 초기화(숨김 기능): 로고를 2초간 누르고 있으면 초기화 확인창
  const pressTimer = useRef<number | undefined>(undefined)
  const startPress = () => {
    pressTimer.current = window.setTimeout(() => setSheet('reset'), 2000)
  }
  const endPress = () => window.clearTimeout(pressTimer.current)

  const items = CHECK_ITEMS.filter((i) => filter === '전체' || i.category === filter)

  return (
    <main className="page home">
      <section className="home-hero">
        <div className="home-profile">
          <div
            className="home-profile__logo"
            onPointerDown={startPress}
            onPointerUp={endPress}
            onPointerLeave={endPress}
            onContextMenu={(e) => e.preventDefault()}
          >
            <LogoMark size={44} />
          </div>
          <div className="home-profile__text">
            <p className="home-profile__loc">{PATIENT_LOCATION}</p>
            <p className="home-profile__name">
              {PATIENT.name} <small>님</small>
            </p>
          </div>
          <button type="button" className="home-profile__icon is-bell pressable" aria-label="알림" onClick={() => setSheet('alarm')}>
            <IconBell size={24} stroke={1.7} />
          </button>
          <button type="button" className="home-profile__icon is-menu pressable" aria-label="메뉴" onClick={() => setSheet('menu')}>
            <IconMenu size={24} stroke={1.9} />
          </button>
        </div>

        <div className="home-actions">
          <button type="button" className="home-action pressable" onClick={() => setSheet('visit')}>
            <IconCalendar size={20} stroke={1.7} />
            <span>면회 예약</span>
          </button>
          <button type="button" className="home-action pressable" onClick={() => navigate('/inquiry/new')}>
            <IconChatDots size={20} stroke={1.7} />
            <span>문의하기</span>
          </button>
        </div>
      </section>

      <section className="home-sheet">
        <div className="home-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'care'} className={`home-tab${tab === 'care' ? ' is-active' : ''}`} onClick={() => setTab('care')}>
            오늘의 돌봄
          </button>
          <button type="button" role="tab" aria-selected={tab === 'check'} className={`home-tab${tab === 'check' ? ' is-active' : ''}`} onClick={() => setTab('check')}>
            확인할 내용
          </button>
        </div>
        <div className="home-tabs__rule" />

        {tab === 'care' ? (
          <div className="home-panel" key="care">
            <div className="care-grid">
              {TODAY_CARE.map((c) => (
                <button key={c.kind} type="button" className="care-card pressable" onClick={() => navigate(`/record/timeline/${today()}`)}>
                  <span className="care-card__icon">
                    <CareIcon kind={c.kind} size={26} />
                  </span>
                  <span className="care-card__label">{c.label}</span>
                  <span className="care-card__title">
                    <Lines text={c.title} />
                  </span>
                  <span className="care-card__rule" />
                  <span className={`care-card__detail${todayCareDetail(c.kind) === '-' ? ' is-empty' : ''}`}>{todayCareDetail(c.kind)}</span>
                </button>
              ))}
            </div>

            <button type="button" className="together-banner pressable" onClick={() => navigate('/together')}>
              <span className="together-banner__title">{TOGETHER_BANNER.title}</span>
              <span className="together-banner__body">
                <Lines text={TOGETHER_BANNER.body} />
              </span>
              <ChevronRight className="together-banner__chev" size={16} stroke={1.6} />
            </button>
          </div>
        ) : (
          <div className="home-panel" key="check">
            <Chips items={FILTERS} value={filter} onChange={setFilter} className="check-chips" />
            <ul className="check-list">
              {items.map((it) => (
                <li key={it.id} className="check-item">
                  <div className="check-item__head">
                    <span className="check-item__icon">{it.icon === 'pen' ? <IconPen size={20} stroke={1.7} /> : <IconMessages size={20} stroke={1.7} />}</span>
                    <div>
                      <p className="check-item__title">{it.title}</p>
                      <p className="check-item__time">{it.time}</p>
                    </div>
                  </div>
                  <p className="check-item__body">
                    <Lines text={it.body} />
                  </p>
                  <button
                    type="button"
                    className="outline-btn pressable"
                    onClick={() => {
                      if (it.linkTo) navigate(it.linkTo)
                      else {
                        setDetail(it)
                        setSheet('detail')
                      }
                    }}
                  >
                    내용 확인
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <InfoSheet open={sheet === 'alarm'} onClose={() => setSheet(null)} title="알림">
        <ul className="sheet-list">
          {NOTIFICATIONS.map((n) => (
            <li key={n.title}>
              <span>{n.title}</span>
              <time>{n.time}</time>
            </li>
          ))}
        </ul>
      </InfoSheet>

      <InfoSheet
        open={sheet === 'visit'}
        onClose={() => setSheet(null)}
        title="면회 예약"
        action={{ label: '확인', onClick: () => setSheet(null) }}
      >
        <p className="sheet__text">
          다음 면회는 <b>내일 오후 3시</b>로 예약되어 있어요.
          <br />
          면회 시간은 매일 오후 2시 ~ 5시이며, 3병동 면회실에서 진행돼요.
        </p>
        <p className="sheet__note">시연용 프로토타입에서는 실제 예약이 진행되지 않아요.</p>
      </InfoSheet>

      <InfoSheet open={sheet === 'menu'} onClose={() => setSheet(null)} title="안심ON">
        <ul className="sheet-list">
          <li>
            <span>환자 정보</span>
            <time>{PATIENT.name} · {PATIENT.ward}</time>
          </li>
          <li>
            <span>연결된 가족</span>
            <time>2명</time>
          </li>
          <li>
            <span>알림 설정</span>
            <time>켜짐</time>
          </li>
        </ul>
        <p className="sheet__note">졸업전시 시연용 프로토타입입니다.</p>
      </InfoSheet>

      <InfoSheet
        open={sheet === 'reset'}
        onClose={() => setSheet(null)}
        title="데모 초기화"
        action={{ label: '처음 상태로 되돌리기', onClick: resetDemo }}
      >
        <p className="sheet__text">채팅·선택한 날짜·필터 등 체험 기록을 모두 지우고 처음 화면으로 돌아가요.</p>
      </InfoSheet>

      <InfoSheet open={sheet === 'detail'} onClose={() => setSheet(null)} title={detail?.detail.title ?? ''}>
        <ul className="sheet-bullets">
          {detail?.detail.lines.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </InfoSheet>
    </main>
  )
}
