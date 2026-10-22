import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { RcChevron, RcChevronDown16 } from '../components/RcIcons'
import {
  CARE_AREAS,
  careDays,
  careToday,
  dateLabel,
  DOW_FULL,
  headlineFor,
  monthLabel,
  moodOf,
  summaryTitle,
  type CareDay,
} from '../data/careDays'
import { addDays, monthMatrix, parseISO } from '../lib/date'
import { useRecordDate } from '../lib/recordDate'
import { setStatusBarColor } from '../lib/statusBar'
import { ChevronLeft } from '../components/Icons'
import { TimelineList } from './CareTimeline'

const appShell = () => document.getElementById('app-shell') as HTMLElement | null


/**
 * 기록 — 첨부된 기록 화면 HTML(js/views/records.js · css/list.css · css/mood.css)을 그대로 옮김
 * 하루 = 카드 한 장. 가운데 카드가 앞에, 전날/다음날 카드가 좌우 뒤에서 회색으로 살짝 보이는
 * 스위블(커버플로) 캐러셀 — 참고 사이트(Reading-Preference-Test #/records)의 records.js 와 같은 움직임.
 * - 위치는 연속 값 pos 하나로 관리. 드래그 중에는 손가락을 그대로 따라가고, 손을 떼면 rAF 트윈으로 snap
 * - 화살표도 같은 트윈. '오늘의 돌봄 흐름 살펴보기'는 카드가 화면 전체로 넓어지며 위로 올라가고
 *   그 아래에서 돌봄 타임라인이 이어져 나타남 (뒤로가기 · 맨 위에서 아래로 당기면 다시 카드로)
 */

function todayIndex(list: CareDay[]) {
  const i = list.findIndex((d) => d.date === careToday())
  return i < 0 ? Math.max(0, list.length - 1) : i
}

export default function Record() {
  const list = careDays()
  const [date, setDate] = useRecordDate()
  const rootRef = useRef<HTMLElement>(null)
  const engineRef = useRef<Engine | null>(null)
  const [monthOpen, setMonthOpen] = useState(false)
  const [toast, setToast] = useState<{ msg: string; on: boolean } | null>(null)

  // 기록 탭에 들어올 때마다 오늘 카드에서 시작
  const entry = useRef<{ start: number } | null>(null)
  if (entry.current === null) entry.current = { start: todayIndex(list) }
  const [index, setIndex] = useState(entry.current.start)
  // 펼친 돌봄 타임라인 (카드가 위로 올라가며 나타남)
  const [openDate, setOpenDate] = useState<string | null>(null)
  const openRef = useRef<{ open: (date: string) => void } | null>(null)
  const day = list[Math.max(0, Math.min(list.length - 1, index))]

  const latest = useRef({ list, setDate })
  latest.current = { list, setDate }

  useEffect(() => {
    if (list[index] && list[index].date !== date) setDate(list[index].date)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  const listKey = list[0]?.date
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const engine = createEngine(root, entry.current!.start, (i) => setIndex(i))
    engineRef.current = engine
    const look = createLook(root)

    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>('[data-action]')
      if (!el || !root.contains(el)) return
      const action = el.dataset.action
      if (action === 'rc-prev') engine.prev()
      else if (action === 'rc-next') engine.next()
      else if (action === 'rc-timeline') {
        // 지금 가운데 있는 카드의 날짜로
        const d = latest.current.list[engine.index()]
        if (d) openRef.current?.open(d.date)
      } else if (action === 'open-months') setMonthOpen(true)
    }
    root.addEventListener('click', onClick)
    return () => {
      root.removeEventListener('click', onClick)
      engine.destroy()
      look.destroy()
      engineRef.current = null
    }
  }, [listKey])

  // 토스트 — 아래에서 떠올라 약 2초 뒤 사라짐 (원본 ui.toast)
  const toastTimers = useRef<number[]>([])
  const showToast = (msg: string) => {
    toastTimers.current.forEach(clearTimeout)
    setToast({ msg, on: false })
    toastTimers.current = [
      window.setTimeout(() => setToast({ msg, on: true }), 20),
      window.setTimeout(() => setToast({ msg, on: false }), 2020),
      window.setTimeout(() => setToast(null), 2240),
    ]
  }
  useEffect(() => () => toastTimers.current.forEach(clearTimeout), [])

  // 달력에서 날짜 선택 → 그 날짜 카드로 (기록이 남아 있지 않은 날은 안내)
  const pickDay = (iso: string) => {
    setMonthOpen(false)
    const hit = list.findIndex((d) => d.date === iso)
    if (hit < 0) showToast(dateLabel(iso) + '은 확인할 수 있는 기록이 없어요')
    else engineRef.current?.go(hit)
  }

  const shell = appShell()

  return (
    <main ref={rootRef} className="page rc-scope screen--records">
      <header className="rc-head">
        <button type="button" className="rc-head__month" data-action="open-months" aria-expanded={monthOpen} aria-label="날짜 선택">
          <span data-rc-month="">{monthLabel(day.date)}</span>
          <RcChevronDown16 />
        </button>
      </header>

      <section className="rc-stage" data-rc-stage="" aria-roledescription="carousel" aria-label="날짜별 돌봄 기록">
        {list.map((d, i) => (
          <RcCard key={d.date} day={d} prev={list[i - 1]} i={i} count={list.length} />
        ))}
      </section>

      <section className="rc-summary" aria-live="polite">
        <h3 className="rc-summary__title" data-rc-sum-title="">
          {summaryTitle(day)}
        </h3>
        <p className="rc-summary__text" data-rc-sum-text="">
          {day.note}
        </p>
      </section>

      <FlowSheet rootRef={rootRef} date={openDate} setDate={setOpenDate} handle={openRef} />

      {shell && createPortal(<CalendarSheet open={monthOpen} value={day.date} onClose={() => setMonthOpen(false)} onPick={pickDay} />, shell)}

      {toast &&
        shell &&
        createPortal(
          <div className={`toast rc-scope rc-toast${toast.on ? ' is-in' : ''}`} role="status">
            {toast.msg}
          </div>,
          shell,
        )}
    </main>
  )
}

/* ───────────── 돌봄 흐름 펼치기 ─────────────
   가운데 카드 자리에서 흰 판이 화면 전체로 넓어지는 동안(clip-path) 카드 내용은 위로 올라가 빠지고,
   카드 바로 아래에 붙어 있던 돌봄 타임라인이 함께 올라와 화면을 채운다.
   접기: 뒤로가기 버튼 · 목록이 맨 위일 때 아래로 당기기 (같은 모션을 거꾸로) */

const OPEN_MS = 380
const CLOSE_RATIO = 0.18 // 이만큼 당기면 접힘
const FLICK_Y = 0.5 // px/ms — 빠르게 당기면 접힘
const easeOut = (t: number) => 1 - Math.pow(1 - t, 4.2) // ≈ cubic-bezier(0.22, 1, 0.36, 1)

type Geo = { T: number; L: number; W: number; H: number; VW: number; VH: number }

function FlowSheet({
  rootRef,
  date,
  setDate,
  handle,
}: {
  rootRef: RefObject<HTMLElement | null>
  date: string | null
  setDate: (d: string | null) => void
  handle: RefObject<{ open: (date: string) => void } | null>
}) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const st = useRef({ q: 0, raf: 0, geo: null as Geo | null, busy: false })

  const paint = (q: number) => {
    const g = st.current.geo
    const sheet = sheetRef.current
    if (!g || !sheet || !trackRef.current) return
    st.current.q = q
    const k = 1 - q
    const top = g.T * k
    const left = g.L * k
    const right = (g.VW - g.L - g.W) * k
    const bottom = (g.VH - g.T - g.H) * k
    sheet.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px round ${8 * k}px)`
    trackRef.current.style.transform = `translate3d(0, ${-q * (g.T + g.H)}px, 0)`
  }

  const animate = (to: number, done?: () => void) => {
    cancelAnimationFrame(st.current.raf)
    const from = st.current.q
    const t0 = performance.now()
    const dur = OPEN_MS * Math.max(0.35, Math.abs(to - from))
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur)
      paint(from + (to - from) * easeOut(t))
      if (t < 1) st.current.raf = requestAnimationFrame(step)
      else done?.()
    }
    st.current.raf = requestAnimationFrame(step)
  }

  const close = () => {
    if (st.current.busy) return
    st.current.busy = true
    setStatusBarColor('#427acf')
    animate(0, () => {
      st.current.busy = false
      rootRef.current?.classList.remove('is-open')
      setDate(null)
    })
  }

  handle.current = {
    open: (d: string) => {
      const root = rootRef.current
      const card = root?.querySelector<HTMLElement>('.rc-card.is-active')
      if (!root || !card || st.current.busy || date) return
      root.scrollTop = 0
      const r = root.getBoundingClientRect()
      const c = card.getBoundingClientRect()
      const k = r.width / (root.offsetWidth || r.width || 1) || 1
      st.current.geo = {
        T: (c.top - r.top) / k,
        L: (c.left - r.left) / k,
        W: card.offsetWidth,
        H: card.offsetHeight,
        VW: root.clientWidth,
        VH: root.clientHeight,
      }
      st.current.q = 0
      setDate(d)
    },
  }

  // 펼치기 시작 — 카드 사본을 같은 자리에 놓고 0 → 1
  useLayoutEffect(() => {
    if (!date) return
    const root = rootRef.current
    const card = root?.querySelector<HTMLElement>('.rc-card.is-active')
    if (cardRef.current && card) cardRef.current.innerHTML = card.innerHTML
    root?.classList.add('is-open')
    paint(0)
    st.current.busy = true
    setStatusBarColor('#ffffff')
    animate(1, () => (st.current.busy = false))
    return () => cancelAnimationFrame(st.current.raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  // 목록이 맨 위일 때 아래로 당기면 접힘
  useEffect(() => {
    const el = scrollRef.current
    const head = sheetRef.current?.querySelector<HTMLElement>('.rc-flow__head')
    if (!date || !el) return
    let drag: null | { y: number; live: boolean; s: { y: number; t: number }[] } = null
    const D = () => {
      const g = st.current.geo
      return g ? g.T + g.H : 500
    }
    const start = (y: number, t: number) => {
      if (st.current.busy) return
      drag = { y, live: false, s: [{ y, t }] }
    }
    const move = (y: number, t: number, e: Event) => {
      if (!drag) return
      const dy = y - drag.y
      if (!drag.live) {
        if (dy < 6 || el.scrollTop > 0) {
          if (dy < -6 || el.scrollTop > 0) drag = null
          return
        }
        drag.live = true
      }
      if (e.cancelable) e.preventDefault()
      drag.s.push({ y, t })
      if (drag.s.length > 6) drag.s.shift()
      cancelAnimationFrame(st.current.raf)
      paint(Math.max(0, Math.min(1, 1 - (dy * 0.9) / D())))
    }
    const end = (t: number) => {
      if (!drag) return
      const d = drag
      drag = null
      if (!d.live) return
      const a = d.s[0]
      const b = d.s[d.s.length - 1]
      const v = t - b.t < 90 ? (b.y - a.y) / Math.max(1, b.t - a.t) : 0
      if (1 - st.current.q > CLOSE_RATIO || v > FLICK_Y) close()
      else animate(1)
    }
    const ts = (e: TouchEvent) => start(e.touches[0].clientY, e.timeStamp)
    const tm = (e: TouchEvent) => move(e.touches[0].clientY, e.timeStamp, e)
    const te = (e: TouchEvent) => end(e.timeStamp)
    const pd = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button === 0) start(e.clientY, e.timeStamp)
    }
    const pm = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') move(e.clientY, e.timeStamp, e)
    }
    const pu = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') end(e.timeStamp)
    }
    const targets = [el, head].filter(Boolean) as HTMLElement[]
    targets.forEach((n) => {
      n.addEventListener('touchstart', ts, { passive: true })
      n.addEventListener('touchmove', tm, { passive: false })
      n.addEventListener('touchend', te)
      n.addEventListener('touchcancel', te)
      n.addEventListener('pointerdown', pd)
    })
    window.addEventListener('pointermove', pm)
    window.addEventListener('pointerup', pu)
    return () => {
      targets.forEach((n) => {
        n.removeEventListener('touchstart', ts)
        n.removeEventListener('touchmove', tm)
        n.removeEventListener('touchend', te)
        n.removeEventListener('touchcancel', te)
        n.removeEventListener('pointerdown', pd)
      })
      window.removeEventListener('pointermove', pm)
      window.removeEventListener('pointerup', pu)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  // 기록 화면을 떠나면 상태바 색 복구는 App 이 처리
  if (!date) return null
  const g = st.current.geo
  return (
    <div ref={sheetRef} className="rc-flow" aria-label="돌봄 타임라인">
      <div ref={trackRef} className="rc-flow__track">
        {g && (
          <div
            ref={cardRef}
            className="rc-flow__card rc-card is-active"
            aria-hidden="true"
            style={{ top: g.T, left: g.L, width: g.W, height: g.H }}
          />
        )}
        <div className="rc-flow__detail" style={{ top: g ? g.T + g.H : 0, height: g ? g.VH : '100%' }}>
          <header className="page-header rc-flow__head">
            <button type="button" className="page-header__back pressable" onClick={close} aria-label="카드로 돌아가기">
              <ChevronLeft size={24} stroke={2} />
            </button>
            <h1 className="page-header__title">돌봄 타임라인</h1>
          </header>
          <div ref={scrollRef} className="rc-flow__scroll">
            <TimelineList date={date} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ───────────── 날짜 선택 (달력 바텀시트) ───────────── */

const WEEK = ['일', '월', '화', '수', '목', '금', '토']

function CalendarSheet({
  open,
  value,
  onClose,
  onPick,
}: {
  open: boolean
  value: string
  onClose: () => void
  onPick: (iso: string) => void
}) {
  const v = parseISO(value)
  const [view, setView] = useState({ y: v.getFullYear(), m: v.getMonth() })
  // 열릴 때마다 보고 있는 날짜의 달로 · 올라오는/내려가는 모션이 끝난 뒤 사라짐
  const [shown, setShown] = useState(open)
  const [on, setOn] = useState(false)
  useEffect(() => {
    if (open) {
      const d = parseISO(value)
      setView({ y: d.getFullYear(), m: d.getMonth() })
      setShown(true)
      let r2 = 0
      const r1 = requestAnimationFrame(() => (r2 = requestAnimationFrame(() => setOn(true))))
      return () => {
        cancelAnimationFrame(r1)
        cancelAnimationFrame(r2)
      }
    }
    setOn(false)
    const t = window.setTimeout(() => setShown(false), 320)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])
  if (!shown && !open) return null

  const move = (n: number) =>
    setView(({ y, m }) => {
      const d = new Date(y, m + n, 1)
      return { y: d.getFullYear(), m: d.getMonth() }
    })
  const last = addDays(careToday(), 1) // 내일까지
  const lastD = parseISO(last)
  const atLastMonth = view.y > lastD.getFullYear() || (view.y === lastD.getFullYear() && view.m >= lastD.getMonth())

  return (
    <div className={`rc-cal rc-scope${on ? ' is-open' : ''}`} role="dialog" aria-modal="true" aria-label="날짜 선택">
      <div className="rc-cal__dim" onClick={onClose} />
      <div className="rc-cal__sheet">
        <div className="rc-cal__head">
          <button type="button" aria-label="이전 달" onClick={() => move(-1)}>
            <RcChevron dir="left" size={24} />
          </button>
          <span>{view.m + 1}월</span>
          <button type="button" aria-label="다음 달" onClick={() => move(1)} disabled={atLastMonth}>
            <RcChevron dir="right" size={24} />
          </button>
        </div>
        <div className="rc-cal__week">
          {WEEK.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>
        <div className="rc-cal__grid">
          {monthMatrix(view.y, view.m).map((c) => (
            <button
              key={c.iso}
              type="button"
              className={`rc-cal__day${c.inMonth ? '' : ' is-out'}${c.iso === value ? ' is-selected' : ''}${
                c.iso === careToday() ? ' is-today' : ''
              }`}
              disabled={c.iso > last}
              onClick={() => onPick(c.iso)}
            >
              {c.day}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ───────────── 카드 ───────────── */

function RcCard({ day, prev, i, count }: { day: CareDay; prev?: CareDay; i: number; count: number }) {
  const mood = moodOf(day, prev)
  const headline = headlineFor(day, mood)
  const d = parseISO(day.date)
  return (
    <article
      className={`rc-card rc-card--${mood}`}
      data-rc-card={i}
      aria-roledescription="slide"
      aria-label={`${dateLabel(day.date)} 기록`}
    >
      <header className="rc-card__head">
        <button type="button" className="rc-card__arrow" data-action="rc-prev" aria-label="이전 날짜" disabled={i === 0}>
          <RcChevron dir="left" size={24} />
        </button>
        <div className="rc-card__date">
          <p className="rc-card__dow">{DOW_FULL[d.getDay()]}</p>
          <h2 className="rc-card__day">{dateLabel(day.date)}</h2>
        </div>
        <button type="button" className="rc-card__arrow" data-action="rc-next" aria-label="다음 날짜" disabled={i === count - 1}>
          <RcChevron dir="right" size={24} />
        </button>
      </header>

      <div className="orb" data-mood={mood} aria-hidden="true" dangerouslySetInnerHTML={{ __html: orbInner(i) }} />

      <section className="rc-day">
        <p className="rc-day__headline">
          {headline.split('\n').map((l, k) => (
            <span key={k}>
              {k > 0 && <br />}
              {l}
            </span>
          ))}
        </p>
        <p className="rc-day__text">{day.dailySummary.text}</p>
      </section>

      <ul className="rc-stats" aria-label={day.date === careToday() ? '오늘의 돌봄 상태' : '이날의 돌봄 상태'}>
        {CARE_AREAS.map((a) => {
          const r = day.careRecords[a.key] ?? { status: '-', state: 'pending' }
          return (
            <li key={a.key} className={`rc-stat rc-stat--${r.state}`}>
              <span className="rc-stat__label">{a.label}</span>
              <span className="rc-stat__value" aria-label={r.state === 'pending' ? '기록 전' : undefined}>
                {r.state === 'pending' ? '-' : r.status}
              </span>
            </li>
          )
        })}
      </ul>

      <button type="button" className="rc-card__more" data-action="rc-timeline">
        오늘의 돌봄 흐름 살펴보기
      </button>
      <span className="rc-card__veil" aria-hidden="true" />
    </article>
  )
}

/** 말풍선 오브제 — 같은 캐릭터가 상태(data-mood)에 따라 색조·표정·자세·움직임만 조금씩 달라짐 */
function orbInner(i: number) {
  const g = 'orb' + i
  return (
    '<div class="orb__pose"><div class="orb__float"><div class="orb__tilt">' +
    '<svg class="orb__svg orb__body-layer" viewBox="0 0 100 100">' +
    '<defs>' +
    `<radialGradient id="${g}b" cx="64" cy="34" r="70" gradientUnits="userSpaceOnUse">` +
    '<stop offset="0" class="orb__stop orb__stop--hi"/>' +
    '<stop offset="0.55" class="orb__stop orb__stop--mid"/>' +
    '<stop offset="1" class="orb__stop orb__stop--lo"/>' +
    '</radialGradient>' +
    `<radialGradient id="${g}h" cx="0.5" cy="0.5" r="0.5">` +
    '<stop offset="0" class="orb__gloss" stop-opacity="0.22"/>' +
    '<stop offset="1" class="orb__gloss" stop-opacity="0"/>' +
    '</radialGradient>' +
    `<radialGradient id="${g}r" cx="60" cy="40" r="60" gradientUnits="userSpaceOnUse">` +
    '<stop offset="0.72" class="orb__rim-stop" stop-opacity="0"/>' +
    '<stop offset="1" class="orb__rim-stop" stop-opacity="0.32"/>' +
    '</radialGradient>' +
    `<radialGradient id="${g}w" cx="72" cy="74" r="46" gradientUnits="userSpaceOnUse">` +
    '<stop offset="0" class="orb__warm-stop" stop-opacity="1"/>' +
    '<stop offset="1" class="orb__warm-stop" stop-opacity="0"/>' +
    '</radialGradient>' +
    '</defs>' +
    '<g class="orb__body">' +
    `<path class="orb__tail" d="M19 70 L14.5 93 Q13.8 96.8 17.4 95.4 L39 86 Z" fill="url(#${g}b)" stroke="url(#${g}b)"/>` +
    `<circle cx="50" cy="46" r="44" fill="url(#${g}b)"/>` +
    `<circle class="orb__warm" cx="50" cy="46" r="44" fill="url(#${g}w)"/>` +
    `<circle class="orb__rim" cx="50" cy="46" r="44" fill="url(#${g}r)"/>` +
    `<ellipse cx="60" cy="32" rx="30" ry="24" fill="url(#${g}h)"/>` +
    '</g>' +
    '</svg>' +
    '<svg class="orb__svg orb__face" viewBox="0 0 100 100">' +
    '<path class="orb__smile" d="M29 58 C33 74.5 67 74.5 71 58"/>' +
    '</svg>' +
    '<span class="orb__signal"></span>' +
    '</div></div></div>' +
    '<span class="orb__shadow-track"><span class="orb__shadow"></span></span>'
  )
}

/* ───────────── 카드 덱 엔진 (원본 createEngine) ───────────── */

const SLIDE_MS = 420 // 카드 넘김 트윈
const DIST_RATIO = 0.22 // 카드 폭의 22% 이상 끌면 넘어감
const FLICK_V = 0.45 // px/ms — 짧게 튕겨도 넘어감
const EDGE_RESIST = 0.28 // 끝 날짜에서 당길 때 저항
const EDGE_MAX = 0.18 // 끝에서 최대로 밀리는 양 (카드 1장 대비)
/* 스위블(커버플로) 배치 — 원본 records.js 그대로 (카드 폭 배수)
   쉬는 상태에서 옆 카드는 SHIFT 만큼만 비켜 메인 카드 뒤에서 회색 가장자리만 보이고,
   넘어가는 도중에는 SWING 만큼 더 벌어져 두 카드가 겹친 채로 순서가 뒤바뀌지 않게 한다.
   실제 translate / rotateY / depth / scale 은 CSS(.rc-card)가 --o · --d · --x · --mid 로 계산 */
const SHIFT = 0.25
const SWING = 0.3
const DRAG_PER_CARD = 1.05 // 카드 폭의 105% 를 끌면 한 장 (초반엔 손가락과 거의 1:1)

type Engine = { prev: () => void; next: () => void; go: (i: number) => void; index: () => number; destroy: () => void }

function createEngine(root: HTMLElement, startIndex: number, onIndex: (i: number) => void): Engine {
  const stage = root.querySelector<HTMLElement>('[data-rc-stage]')!
  const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-rc-card]'))
  const last = cards.length - 1
  let index = startIndex
  let pos = startIndex
  let raf = 0
  let drag: null | { id: number; x: number; y: number; start: number; w: number; live: boolean; samples: { x: number; t: number }[] } = null
  let suppressClick = false

  const ease = (t: number) => 1 - Math.pow(1 - t, 5) // ≈ cubic-bezier(0.22, 1, 0.36, 1)

  function paint() {
    for (let i = 0; i < cards.length; i++) {
      const o = i - pos
      const d = Math.abs(o)
      const el = cards[i]
      const dc = Math.min(d, 2)
      const x = (o < 0 ? -1 : 1) * (SHIFT * dc + SWING * Math.sin(Math.PI * Math.min(dc, 1)))
      el.style.setProperty('--o', o.toFixed(4))
      el.style.setProperty('--d', dc.toFixed(4))
      el.style.setProperty('--x', x.toFixed(4))
      el.style.setProperty('--mid', Math.sin(Math.PI * Math.min(dc, 1)).toFixed(4))
      el.style.zIndex = String(100 - Math.round(d * 10))
      el.classList.toggle('is-hidden', d > 1.9)
      const active = d < 0.5
      el.classList.toggle('is-active', active)
      el.setAttribute('aria-hidden', active ? 'false' : 'true')
      ;(el as HTMLElement & { inert: boolean }).inert = !active
    }
  }

  function setIndex(i: number) {
    if (i === index) return
    index = i
    onIndex(i)
  }

  function animateTo(target: number) {
    target = Math.max(0, Math.min(last, target))
    setIndex(target)
    cancelAnimationFrame(raf)
    const from = pos
    const dist = target - from
    if (Math.abs(dist) < 0.0005) {
      pos = target
      paint()
      return
    }
    const t0 = performance.now()
    // 여러 장을 건너뛸 때(월 선택)만 조금 더 길게
    const dur = SLIDE_MS * Math.min(1.6, Math.max(1, Math.abs(dist)))
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur)
      pos = from + dist * ease(t)
      paint()
      if (t < 1) raf = requestAnimationFrame(step)
      else {
        pos = target
        paint()
        raf = 0
      }
    }
    raf = requestAnimationFrame(step)
  }

  const width = () => (cards[0] ? cards[0].offsetWidth : stage.clientWidth)

  // 끝 날짜에서는 넘어가지 않고 조금만 밀린다
  function resist(p: number) {
    if (p < 0) return -EDGE_MAX * (1 - 1 / (1 + (-p * EDGE_RESIST) / EDGE_MAX * 4))
    if (p > last) return last + EDGE_MAX * (1 - 1 / (1 + ((p - last) * EDGE_RESIST) / EDGE_MAX * 4))
    return p
  }

  function onDown(e: PointerEvent) {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    cancelAnimationFrame(raf) // 트윈 중이면 그 자리에서 이어받기
    raf = 0
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, start: pos, w: width() * DRAG_PER_CARD, live: false, samples: [{ x: e.clientX, t: e.timeStamp }] }
    suppressClick = false
  }

  function onMove(e: PointerEvent) {
    if (!drag || e.pointerId !== drag.id) return
    const dx = e.clientX - drag.x
    const dy = e.clientY - drag.y
    if (!drag.live) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return
      if (Math.abs(dy) > Math.abs(dx)) {
        // 세로 스크롤에 양보 — 트윈 도중 잡았던 경우 가장 가까운 카드로 마저 정리
        const p = drag.start
        drag = null
        if (Math.abs(p - Math.round(p)) > 0.001) animateTo(Math.round(p))
        return
      }
      drag.live = true
      suppressClick = true
      stage.classList.add('is-dragging')
      try {
        stage.setPointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
    }
    e.preventDefault()
    drag.samples.push({ x: e.clientX, t: e.timeStamp })
    if (drag.samples.length > 6) drag.samples.shift()
    // 가운데 카드가 손가락과 1:1 로 움직이도록
    pos = resist(drag.start - dx / drag.w)
    paint()
  }

  function onUp(e: PointerEvent) {
    if (!drag || e.pointerId !== drag.id) return
    const wasLive = drag.live
    const s = drag.samples
    let v = 0
    if (s.length > 1) {
      const a = s[0]
      const b = s[s.length - 1]
      const dt = Math.max(1, b.t - a.t)
      if (e.timeStamp - b.t < 90) v = (b.x - a.x) / dt // 멈췄다 놓으면 속도 0
    }
    const moved = drag.start - pos // + 면 오른쪽으로 끌었음(이전 날짜 방향)
    const base = Math.round(drag.start)
    const startedMid = Math.abs(drag.start - base) > 0.001
    drag = null
    stage.classList.remove('is-dragging')
    if (!wasLive) {
      if (startedMid) animateTo(base) // 트윈 도중 탭만 했으면 마저 정리
      return
    }
    let target = base
    if (moved < -DIST_RATIO || v < -FLICK_V) target = base + 1
    else if (moved > DIST_RATIO || v > FLICK_V) target = base - 1
    // 한 번에 여러 장을 크게 끌었다면 가장 가까운 카드로
    if (Math.abs(pos - base) > 1) target = Math.round(pos)
    animateTo(target)
  }

  function onClickCapture(e: MouseEvent) {
    if (suppressClick) {
      e.stopPropagation()
      e.preventDefault()
      suppressClick = false
    }
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') {
      animateTo(index - 1)
      e.preventDefault()
    }
    if (e.key === 'ArrowRight') {
      animateTo(index + 1)
      e.preventDefault()
    }
  }
  const onDragStart = (e: Event) => e.preventDefault()

  stage.addEventListener('pointerdown', onDown)
  stage.addEventListener('pointermove', onMove)
  stage.addEventListener('pointerup', onUp)
  stage.addEventListener('pointercancel', onUp)
  stage.addEventListener('click', onClickCapture, true)
  stage.addEventListener('dragstart', onDragStart)
  stage.addEventListener('keydown', onKey)

  paint()

  return {
    prev: () => animateTo(index - 1),
    next: () => animateTo(index + 1),
    go: animateTo,
    index: () => index,
    destroy: () => {
      cancelAnimationFrame(raf)
      stage.removeEventListener('pointerdown', onDown)
      stage.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerup', onUp)
      stage.removeEventListener('pointercancel', onUp)
      stage.removeEventListener('click', onClickCapture, true)
      stage.removeEventListener('dragstart', onDragStart)
      stage.removeEventListener('keydown', onKey)
    },
  }
}

/* ───────────── 포인터 따라보기 (원본 createLook) ─────────────
   누른 곳을 빠르게(약 90ms) 약 110%까지 바라봤다 100%로, 움직이는 동안 부드럽게 따라오고,
   손을 떼면 200ms 바라본 뒤 천천히 정면으로. 얼굴 ±11 / ±7.5 px · 몸 rotateY ±11° / rotateX ±7.5° · 그림자 ±5px */

const LOOK = { faceX: 11, faceY: 7.5, rotY: 11, rotX: 7.5, shadowX: 5, hold: 200 }
const SPRING = { snap: { w: 42, z: 0.57 }, follow: { w: 19, z: 1 }, settle: { w: 10, z: 1 } }
const SNAP_MS = 170

function createLook(root: HTMLElement) {
  const reduced = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const target = { x: 0, y: 0 }
  const pos = { x: 0, y: 0 }
  const vel = { x: 0, y: 0 }
  let mode = SPRING.follow
  let raf = 0
  let last = 0
  let el: HTMLElement | null = null
  let touching = false
  let snapTimer = 0
  let holdTimer = 0

  const activeOrb = () => root.querySelector<HTMLElement>('.rc-card.is-active .orb')

  // 화면 기준 범위 — 앱 화면 전체
  function frame() {
    const app = appShell()
    const r = app ? app.getBoundingClientRect() : null
    return { hw: (r && r.width ? r.width : window.innerWidth) / 2, hh: (r && r.height ? r.height : window.innerHeight) / 2 }
  }

  function write(node: HTMLElement | null, x: number, y: number) {
    if (!node) return
    node.style.setProperty('--rx', (y * -LOOK.rotX).toFixed(3) + 'deg')
    node.style.setProperty('--ry', (x * LOOK.rotY).toFixed(3) + 'deg')
    node.style.setProperty('--fx', (x * LOOK.faceX).toFixed(3) + 'px')
    node.style.setProperty('--fy', (y * LOOK.faceY).toFixed(3) + 'px')
    node.style.setProperty('--sx', (x * LOOK.shadowX).toFixed(3) + 'px')
  }

  function step(axis: 'x' | 'y', dt: number) {
    const w = mode.w
    const z = reduced ? 1 : mode.z
    const a = w * w * (target[axis] - pos[axis]) - 2 * z * w * vel[axis]
    vel[axis] += a * dt
    pos[axis] += vel[axis] * dt
  }

  function tick(now: number) {
    const dt = Math.min(0.05, (now - (last || now)) / 1000)
    last = now
    const n = Math.max(1, Math.ceil(dt / 0.004))
    for (let i = 0; i < n; i++) {
      step('x', dt / n)
      step('y', dt / n)
    }
    const node = activeOrb()
    if (node !== el) {
      write(el, 0, 0) // 날짜가 바뀌면 이전 오브제는 정면으로
      el = node
    }
    write(el, pos.x, pos.y)
    const moving = Math.abs(target.x - pos.x) + Math.abs(target.y - pos.y) + Math.abs(vel.x) + Math.abs(vel.y)
    if (moving > 0.0008) raf = requestAnimationFrame(tick)
    else {
      raf = 0
      last = 0
    }
  }

  const kick = () => {
    if (!raf) raf = requestAnimationFrame(tick)
  }
  const clamp = (v: number) => Math.max(-1, Math.min(1, v))

  function aim(px: number, py: number, snap: boolean) {
    const node = activeOrb()
    const body = node && node.querySelector('.orb__tilt')
    if (!body) return
    const box = body.getBoundingClientRect()
    const f = frame()
    let x = clamp((px - (box.left + box.width / 2)) / f.hw)
    let y = clamp((py - (box.top + box.height / 2)) / f.hh)
    // 원 안으로 — 대각선에서 두 축이 동시에 최대가 되지 않게
    const m = Math.sqrt(x * x + y * y)
    if (m > 1) {
      x /= m
      y /= m
    }
    target.x = x
    target.y = y
    clearTimeout(holdTimer)
    if (snap) {
      mode = SPRING.snap
      clearTimeout(snapTimer)
      snapTimer = window.setTimeout(() => (mode = SPRING.follow), SNAP_MS)
    } else if (mode !== SPRING.snap) mode = SPRING.follow
    kick()
  }

  function release(hold: number) {
    clearTimeout(holdTimer)
    holdTimer = window.setTimeout(() => {
      target.x = 0
      target.y = 0
      mode = SPRING.settle
      kick()
    }, hold || 0)
  }

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') touching = true
    aim(e.clientX, e.clientY, true)
  }
  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' && !touching) return
    aim(e.clientX, e.clientY, false)
  }
  const onPointerUp = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') return
    touching = false
    release(LOOK.hold)
  }
  const onTouchMove = (e: TouchEvent) => {
    const t = e.touches && e.touches[0]
    if (!t) return
    touching = true
    aim(t.clientX, t.clientY, false)
  }
  const onTouchEnd = (e: TouchEvent) => {
    if (e.touches && e.touches.length) return
    if (!touching) return
    touching = false
    release(LOOK.hold)
  }
  const onMouseOut = (e: MouseEvent) => {
    if (!e.relatedTarget) release(0)
  }
  const releaseNow = () => release(0)

  const opts = { passive: true }
  window.addEventListener('pointerdown', onPointerDown, opts)
  window.addEventListener('pointermove', onPointerMove, opts)
  window.addEventListener('pointerup', onPointerUp, opts)
  window.addEventListener('touchmove', onTouchMove, opts)
  window.addEventListener('touchend', onTouchEnd, opts)
  window.addEventListener('touchcancel', onTouchEnd, opts)
  document.addEventListener('mouseout', onMouseOut)
  document.documentElement.addEventListener('mouseleave', releaseNow)
  window.addEventListener('blur', releaseNow)

  return {
    destroy() {
      cancelAnimationFrame(raf)
      clearTimeout(snapTimer)
      clearTimeout(holdTimer)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
      document.removeEventListener('mouseout', onMouseOut)
      document.documentElement.removeEventListener('mouseleave', releaseNow)
      window.removeEventListener('blur', releaseNow)
    },
  }
}
