import { addDays, todayISO } from '../lib/date'

/**
 * 기록 (하루 카드 + 돌봄 타임라인) — 첨부된 기록 화면 HTML의 데이터를 그대로 옮김
 * ─────────────────────────────────────────────
 * 하루 = 한 객체. 카드와 타임라인이 같은 객체를 나눠 씀.
 *   dailySummary  tone "calm" 평소와 같음 · "change" 살펴볼 변화 · "upcoming" 기록 전
 *   careRecords   네 가지 돌봄의 한 단어 상태 { status, state: done | watch | attention | pending }
 *   timeline      시간 순 실제 기록 (돌봄 타임라인 화면)
 *   note          카드 아래 요약 카드 문장
 *
 * 날짜는 기기의 실제 오늘을 기준으로 붙임: 6일 전 ~ 오늘 ~ 내일 (원본: 9/17 ~ 9/23(오늘) ~ 9/24)
 */

export type AreaKey = 'meal' | 'activity' | 'toilet' | 'hygiene'
export type RecordState = 'done' | 'watch' | 'attention' | 'pending'
export type Mood = 'normal' | 'check' | 'attention' | 'recovery' | 'rest'

export type CareRow = { period: string; area: AreaKey; title: string; detail: string; at: string; watch?: boolean }
export type CareDay = {
  date: string
  dailySummary: { tone: 'calm' | 'change' | 'upcoming'; headline: string; text: string }
  careRecords: Record<AreaKey, { status: string; state: RecordState }>
  timeline: CareRow[]
  note: string
}

export const CARE_AREAS: { key: AreaKey; label: string }[] = [
  { key: 'meal', label: '식사' },
  { key: 'activity', label: '활동' },
  { key: 'toilet', label: '배설' },
  { key: 'hygiene', label: '위생' },
]

/** 타임라인 시간대 */
export const CARE_PERIODS = [
  { key: 'morning', label: '아침 돌봄', time: '06:00 - 09:00' },
  { key: 'forenoon', label: '오전 돌봄', time: '09:00 - 12:00' },
  { key: 'lunch', label: '점심 돌봄', time: '12:00-13:00' },
  { key: 'afternoon', label: '오후 돌봄', time: '13:00-17:00' },
  { key: 'evening', label: '저녁 돌봄', time: '17:00-20:00' },
]

/** 오브제 상태별 문장 — today = 오늘 카드, past = 지난 날짜 카드 */
export const MOOD_COPY: Record<Mood, { today: string; past: string }> = {
  normal: { today: '현재까지 평소와 다름없는\n하루를 보내고 있어요', past: '평소와 다름없는\n하루를 보냈어요' },
  check: { today: '오늘은 평소와 조금 다른\n모습이 관찰됐어요', past: '평소와 조금 다른\n모습이 관찰됐어요' },
  // 변화가 있는 날도 문장은 평소와 같고, 오브제의 주황 점과 해당 값(주황)으로만 알림 — 시안
  attention: { today: '현재까지 평소와 다름없는\n하루를 보내고 있어요', past: '평소와 다름없는\n하루를 보냈어요' },
  recovery: { today: '어제보다 조금 더 안정적인\n모습을 보이고 있어요', past: '전날보다 조금 더 안정적인\n모습을 보였어요' },
  rest: { today: '아직 기록이\n시작되기 전이에요', past: '아직 기록이\n시작되기 전이에요' },
}

type DayTemplate = Omit<CareDay, 'date'> & { offset: number }

const DAYS: DayTemplate[] = [
  {
    offset: -6,
    dailySummary: { tone: 'calm', headline: '평소와 비슷한\n하루였어요', text: '식사와 활동 모두 평소 수준이었고, 오전에 병동 복도를 산책하셨어요.' },
    careRecords: {
      meal: { status: '원활', state: 'done' },
      activity: { status: '산책', state: 'done' },
      toilet: { status: '안정', state: 'done' },
      hygiene: { status: '완료', state: 'done' },
    },
    timeline: [
      { period: 'morning', area: 'meal', title: '아침 식사', detail: '아침 2/3', at: '08:05' },
      { period: 'forenoon', area: 'activity', title: '오전 활동', detail: '병동 복도 산책 20분', at: '10:40' },
      { period: 'forenoon', area: 'hygiene', title: '위생관리', detail: '구강 위생, 상태 이상 없음', at: '11:20' },
      { period: 'lunch', area: 'meal', title: '점심 식사', detail: '점심 2/3', at: '12:40' },
      { period: 'afternoon', area: 'toilet', title: '배설', detail: '소변 3회 · 대변 1회, 정상 양상', at: '15:10' },
      { period: 'evening', area: 'meal', title: '저녁 식사', detail: '저녁 1/2', at: '18:10' },
    ],
    note: '평소와 다른 변화는 확인되지 않았어요',
  },
  {
    offset: -5,
    dailySummary: { tone: 'change', headline: '평소와 다른 변화가\n한 가지 있었어요', text: '활동과 배설은 평소와 같았고, 점심 식사량이 줄어 저녁에 다시 살폈어요.' },
    careRecords: {
      meal: { status: '조금 적음', state: 'watch' },
      activity: { status: '재활 완료', state: 'done' },
      toilet: { status: '안정', state: 'done' },
      hygiene: { status: '완료', state: 'done' },
    },
    timeline: [
      { period: 'morning', area: 'meal', title: '아침 식사', detail: '아침 2/3', at: '08:12' },
      { period: 'forenoon', area: 'hygiene', title: '위생관리', detail: '오전 목욕, 피부 상태 양호', at: '10:05' },
      { period: 'forenoon', area: 'activity', title: '오전 활동', detail: '작업치료', at: '11:25' },
      { period: 'lunch', area: 'meal', title: '점심 식사', detail: '점심 1/3 · 평소보다 적게 드심', at: '12:45', watch: true },
      { period: 'afternoon', area: 'toilet', title: '배설', detail: '소변 2회, 정상 양상', at: '15:30' },
      { period: 'evening', area: 'meal', title: '저녁 식사', detail: '저녁 2/3 · 다시 확인함', at: '18:20' },
    ],
    note: '점심 식사량이 조금 줄어 저녁에 다시 살폈어요',
  },
  {
    offset: -4,
    dailySummary: { tone: 'calm', headline: '편안하게 쉬어 간\n하루였어요', text: '주말이라 재활 없이 병실에서 쉬셨고, 식사는 평소보다 잘 드셨어요.' },
    careRecords: {
      meal: { status: '원활', state: 'done' },
      activity: { status: '휴식', state: 'done' },
      toilet: { status: '안정', state: 'done' },
      hygiene: { status: '완료', state: 'done' },
    },
    timeline: [
      { period: 'morning', area: 'meal', title: '아침 식사', detail: '아침 전량', at: '08:20' },
      { period: 'forenoon', area: 'hygiene', title: '위생관리', detail: '세안과 손 위생', at: '10:30' },
      { period: 'lunch', area: 'meal', title: '점심 식사', detail: '점심 2/3', at: '12:35' },
      { period: 'afternoon', area: 'activity', title: '오후 활동', detail: '병실 휴식', at: '14:00' },
      { period: 'afternoon', area: 'toilet', title: '배설', detail: '소변 3회 · 대변 1회, 정상 양상', at: '16:10' },
      { period: 'evening', area: 'meal', title: '저녁 식사', detail: '저녁 2/3', at: '18:05' },
    ],
    note: '평소와 다른 변화는 확인되지 않았어요',
  },
  {
    offset: -3,
    dailySummary: { tone: 'calm', headline: '가족과 함께한\n따뜻한 하루였어요', text: '오후에 가족 면회가 있었고, 면회 뒤에도 편안하게 휴식하셨어요.' },
    careRecords: {
      meal: { status: '원활', state: 'done' },
      activity: { status: '면회', state: 'done' },
      toilet: { status: '안정', state: 'done' },
      hygiene: { status: '완료', state: 'done' },
    },
    timeline: [
      { period: 'morning', area: 'meal', title: '아침 식사', detail: '아침 2/3', at: '08:10' },
      { period: 'forenoon', area: 'hygiene', title: '위생관리', detail: '구강 위생, 상태 이상 없음', at: '11:10' },
      { period: 'lunch', area: 'meal', title: '점심 식사', detail: '점심 2/3', at: '12:30' },
      { period: 'afternoon', area: 'activity', title: '가족 면회', detail: '오후 3시 · 40분', at: '15:45' },
      { period: 'afternoon', area: 'toilet', title: '배설', detail: '소변 2회 · 대변 1회, 정상 양상', at: '16:30' },
      { period: 'evening', area: 'meal', title: '저녁 식사', detail: '저녁 1/2', at: '18:15' },
    ],
    note: '면회 후 편안하게 휴식하셨어요',
  },
  {
    offset: -2,
    dailySummary: { tone: 'change', headline: '평소와 다른 변화가\n한 가지 있었어요', text: '식사와 활동은 평소 수준이었고, 배설 상태를 조금 더 지켜보고 있어요.' },
    careRecords: {
      meal: { status: '원활', state: 'done' },
      activity: { status: '재활 완료', state: 'done' },
      toilet: { status: '변화있음', state: 'attention' },
      hygiene: { status: '완료', state: 'done' },
    },
    timeline: [
      { period: 'morning', area: 'meal', title: '아침 식사', detail: '아침 1/2', at: '08:12' },
      { period: 'forenoon', area: 'activity', title: '오전 활동', detail: '작업치료', at: '11:25' },
      { period: 'forenoon', area: 'hygiene', title: '위생관리', detail: '목욕, 상태 이상 없음', at: '11:25' },
      { period: 'lunch', area: 'meal', title: '점심 식사', detail: '점심 1/3', at: '14:35' },
      { period: 'lunch', area: 'toilet', title: '배설', detail: '소변 200ml', at: '14:35' },
      { period: 'afternoon', area: 'activity', title: '오후 활동', detail: '병실 휴식', at: '15:40' },
      { period: 'afternoon', area: 'toilet', title: '배설', detail: '소변 중간량 · 대변 소량, 경과 관찰', at: '16:20', watch: true },
      { period: 'evening', area: 'meal', title: '저녁 식사', detail: '저녁 1/2', at: '18:10' },
    ],
    note: '배설 경과를 지켜보고 있고, 그 밖에는 평소와 같았어요',
  },
  {
    offset: -1,
    dailySummary: { tone: 'calm', headline: '평소와 비슷한\n하루였어요', text: '오전 재활을 마치셨고, 식사와 배설 모두 평소처럼 이어졌어요.' },
    careRecords: {
      meal: { status: '원활', state: 'done' },
      activity: { status: '재활 완료', state: 'done' },
      toilet: { status: '안정', state: 'done' },
      hygiene: { status: '완료', state: 'done' },
    },
    timeline: [
      { period: 'morning', area: 'meal', title: '아침 식사', detail: '아침 2/3', at: '08:08' },
      { period: 'forenoon', area: 'activity', title: '오전 활동', detail: '물리치료', at: '10:50' },
      { period: 'forenoon', area: 'hygiene', title: '위생관리', detail: '침상 세발, 상태 이상 없음', at: '11:30' },
      { period: 'lunch', area: 'meal', title: '점심 식사', detail: '점심 2/3', at: '12:40' },
      { period: 'afternoon', area: 'toilet', title: '배설', detail: '소변 3회 · 대변 1회, 정상 양상', at: '15:20' },
      { period: 'evening', area: 'meal', title: '저녁 식사', detail: '저녁 2/3', at: '18:00' },
    ],
    note: '평소와 다른 변화는 확인되지 않았어요',
  },
  {
    offset: 0,
    dailySummary: {
      tone: 'calm',
      headline: '지금까지 평소와\n비슷한 하루예요',
      text: '점심 식사까지 평소처럼 이어졌어요\n위생기록은 아직 올라오기 전이에요',
    },
    careRecords: {
      meal: { status: '원활', state: 'done' },
      activity: { status: '양호', state: 'done' },
      toilet: { status: '안정', state: 'done' },
      hygiene: { status: '기록 전', state: 'pending' },
    },
    timeline: [
      { period: 'morning', area: 'meal', title: '아침 식사', detail: '아침 2/3', at: '08:12' },
      { period: 'forenoon', area: 'activity', title: '오전 활동', detail: '물리치료', at: '11:05' },
      { period: 'lunch', area: 'meal', title: '점심 식사', detail: '점심 1/2', at: '12:50' },
      { period: 'afternoon', area: 'toilet', title: '배설', detail: '소변 2회 · 대변 1회, 정상 양상', at: '14:35' },
    ],
    note: '현재까지 평소와 다른 변화는 확인되지 않았어요',
  },
  {
    offset: 1,
    dailySummary: { tone: 'upcoming', headline: '아직 기록이\n시작되기 전이에요', text: '하루 돌봄이 시작되면 이곳에 순서대로 기록이 올라와요.' },
    careRecords: {
      meal: { status: '기록 전', state: 'pending' },
      activity: { status: '기록 전', state: 'pending' },
      toilet: { status: '기록 전', state: 'pending' },
      hygiene: { status: '기록 전', state: 'pending' },
    },
    timeline: [],
    note: '돌봄이 시작되면 이곳에 기록이 올라와요',
  },
]

/** 카드 순서대로 하루 목록 (오늘 날짜가 바뀌면 자동으로 다시 계산) */
let cache: { today: string; list: CareDay[] } | null = null
export function careDays(): CareDay[] {
  const t = todayISO()
  if (!cache || cache.today !== t) {
    cache = { today: t, list: DAYS.map(({ offset, ...d }) => ({ ...d, date: addDays(t, offset) })) }
  }
  return cache.list
}

export const careToday = () => todayISO()

export function careDay(iso: string): CareDay | undefined {
  return careDays().find((d) => d.date === iso)
}

function changeLevel(day?: CareDay) {
  if (!day) return 0
  let level = 0
  for (const k of Object.keys(day.careRecords) as AreaKey[]) {
    const s = day.careRecords[k].state
    if (s === 'attention') level = Math.max(level, 2)
    else if (s === 'watch') level = Math.max(level, 1)
  }
  return level
}

/** 그날 네 가지 기록과 전날 기록을 종합한 오브제 상태 */
export function moodOf(day: CareDay, prev?: CareDay): Mood {
  if (day.dailySummary.tone === 'upcoming') return 'rest'
  const level = changeLevel(day)
  if (level === 2) return 'attention'
  if (level === 1) return 'check'
  if (changeLevel(prev) > 0) return 'recovery'
  return 'normal'
}

export function headlineFor(day: CareDay, mood: Mood) {
  const copy = MOOD_COPY[mood]
  return day.date === careToday() || mood === 'rest' ? copy.today : copy.past
}

export const dateLabel = (iso: string) => `${Number(iso.slice(5, 7))}월 ${Number(iso.slice(8, 10))}일`
export const monthLabel = (iso: string) => `${iso.slice(0, 4)}년 ${Number(iso.slice(5, 7))}월`
export const DOW_FULL = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

export function summaryTitle(day: CareDay) {
  if (day.date === careToday()) return '오늘의 돌봄'
  if (day.dailySummary.tone === 'upcoming') return '다음 돌봄'
  return dateLabel(day.date) + '의 돌봄'
}
