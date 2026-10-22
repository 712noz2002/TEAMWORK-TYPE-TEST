import { useEffect, useRef } from 'react'
import { Chips, LogoBadge } from '../components/Bits'
import { PATIENT, PATIENT_LOCATION, ROOM_STATUS, SUPPLIES } from '../data/mock'
import { useStoredState } from '../lib/storage'

const FILTERS = ['전체', '물품', '식품'] as const
type Filter = (typeof FILTERS)[number]

/** 병실 이미지 영역 높이: 펼침(IMAGE 15) ↔ 접힘(IMAGE 16) */
const HERO_FULL = 459
const HERO_MIN = 145
const COLLAPSE = HERO_FULL - HERO_MIN

export default function Together() {
  const [filter, setFilter] = useStoredState<Filter>('together.filter', '전체')
  const pageRef = useRef<HTMLElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  // 스크롤에 따라 병실 이미지가 위로 접히고(IMAGE 16), 다시 내리면 펼쳐짐(IMAGE 15)
  useEffect(() => {
    const page = pageRef.current
    const hero = heroRef.current
    if (!page || !hero) return
    let raf = 0
    const update = () => {
      raf = 0
      const y = Math.min(Math.max(page.scrollTop, 0), COLLAPSE)
      const p = y / COLLAPSE
      hero.style.setProperty('--tg-shift', `${y}px`)
      hero.style.setProperty('--tg-p', p.toFixed(4))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    page.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      page.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  const list = SUPPLIES.filter((s) => filter === '전체' || s.category === filter)

  return (
    <main className="page together" ref={pageRef}>
      <div className="tg-hero" ref={heroRef} style={{ height: `calc(${HERO_FULL}px + var(--sat))`, top: -COLLAPSE }}>
        <div className="tg-hero__photo">
          <img src="/images/room.jpg" alt="김영숙님의 병실" draggable={false} />
        </div>
        {/* 접힌 상태(IMAGE 16)의 천장 이미지 — 스크롤하면 서서히 나타남 */}
        <div className="tg-hero__ceiling" aria-hidden>
          <img src="/images/room-ceiling.jpg" alt="" draggable={false} />
        </div>
        <div className="tg-status">
          <p className="tg-status__label">{ROOM_STATUS.label}</p>
          <p className="tg-status__text">{ROOM_STATUS.text}</p>
        </div>
        <svg className="tg-tab" viewBox="0 0 375 56" preserveAspectRatio="none" aria-hidden>
          <path d="M0 0H157C168 0 175 4 178 12L187 41C190 50 196 54 207 54H375V56H0Z" fill="#fff" />
        </svg>
        <div className="tg-room">
          <p className="tg-room__name">{PATIENT.name}님 병실</p>
          <p className="tg-room__loc">{PATIENT_LOCATION}</p>
        </div>
        <Chips items={FILTERS} value={filter} onChange={setFilter} className="tg-chips" />
      </div>

      <ul className="tg-list">
        {list.map((s) => (
          <li key={s.name} className="tg-item">
            <LogoBadge size={34} mark={32} />
            <div className="tg-item__text">
              <p className="tg-item__name">
                {s.name}
                <i>•</i>
                <span>{s.qty}</span>
              </p>
              <p className="tg-item__date">전달일 {s.date}</p>
            </div>
            <span className={`tg-pill${s.need ? ' is-need' : ''}`}>{s.need ? '필요해요' : '충분해요'}</span>
          </li>
        ))}
      </ul>
    </main>
  )
}
