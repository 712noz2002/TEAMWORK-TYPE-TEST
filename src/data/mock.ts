import { addDays, todayISO } from '../lib/date'
import { careDay } from './careDays'

/**
 * 안심ON 시연용 데이터 (Mock Data)
 * ─────────────────────────────────────────────
 * 실제 병원·환자 데이터가 아닌 졸업전시 시연용 데이터입니다.
 * 화면 문구를 바꾸고 싶으면 이 파일만 수정하면 됩니다.
 */

export const PATIENT = {
  name: '김영숙',
  hospital: '더조은요양병원',
  ward: '3병동 305호',
}
export const PATIENT_LOCATION = `${PATIENT.hospital} · ${PATIENT.ward}`

/** 기록 화면의 '오늘' — 기기의 실제 오늘 날짜를 사용 (항상 최신 날짜로 열림) */
export const today = () => todayISO()
/** 기록 화면에서 넘겨볼 수 있는 마지막 날짜 = 내일 (실제 달력 계산: 월말·연말 자동 처리) */
export const lastRecordDay = () => addDays(todayISO(), 1)

/* ───────────── 홈 · 오늘의 돌봄 (IMAGE 01) ───────────── */
export type CareKind = 'meal' | 'activity' | 'excretion' | 'hygiene'

export const TODAY_CARE: { kind: CareKind; label: string; title: string; detail: string }[] = [
  { kind: 'meal', label: '식사', title: '평소보다\n식사가 원활해요', detail: '' },
  { kind: 'activity', label: '활동 · 재활', title: '활동 상태가\n양호해요', detail: '' },
  { kind: 'excretion', label: '배설', title: '배설 양상에 변화가\n있지만 안정적이에요', detail: '' },
  { kind: 'hygiene', label: '위생', title: '아직 위생 기록\n전이에요', detail: '' },
]

/** 홈 카드 아래 한 줄 요약 — 오늘의 돌봄 타임라인 기록에서 계산 (기록 화면 · 타임라인과 항상 일치) */
export function todayCareDetail(kind: CareKind) {
  const area = kind === 'excretion' ? 'toilet' : kind
  const rows = (careDay(today())?.timeline ?? []).filter((r) => r.area === area)
  if (kind === 'meal') {
    const pick = (w: string) => rows.find((r) => r.detail.startsWith(w))?.detail.replace(w + ' ', '').split(' · ')[0] ?? '-'
    return `아침 ${pick('아침')} · 점심 ${pick('점심')} · 저녁 ${pick('저녁')}`
  }
  return rows.length ? rows[rows.length - 1].detail : '-'
}

export const TOGETHER_BANNER = {
  title: '함께 ON',
  body: '이번 면회 때 어머니와 가을 이야기를 나눠보세요.\n요즘 병동에서 가을 풍경 이야기에 관심을 많이 보이셨어요.',
}

/* ───────────── 홈 · 확인할 내용 (IMAGE 02) ───────────── */
export type CheckCategory = '진료' | '면회'
export type CheckItem = {
  id: string
  icon: 'pen' | 'messages'
  category: CheckCategory
  title: string
  time: string
  body: string
  /** 내용 확인 → 상세 모달 내용 */
  detail: { title: string; lines: string[] }
  /** 지정 시 내용 확인 → 해당 문의 타임라인으로 이동 */
  linkTo?: string
}

export const CHECK_ITEMS: CheckItem[] = [
  {
    id: 'exam',
    icon: 'pen',
    category: '진료',
    title: '추가 검사 안내',
    time: '3시간 전',
    body: '김영숙님의 무릎 통증 원인을 확인하기 위한 검사입니다.',
    detail: {
      title: '추가 검사 안내',
      lines: [
        '무릎 통증 원인을 확인하기 위해 X-ray 검사가 예정되어 있어요.',
        '검사 일정 : 9월 23일(수) 오전 10시',
        '검사 결과는 담당 의료진 확인 후 안심ON으로 안내드릴게요.',
      ],
    },
  },
  {
    id: 'answer',
    icon: 'messages',
    category: '진료',
    title: '문의 결과',
    time: '9시간 전',
    body: '9월 2일에 남겨주신 문의에 대한 문의 답변이 도착했습니다.',
    detail: { title: '문의 결과', lines: [] },
    linkTo: '/inquiry/timeline/bruise-done',
  },
  {
    id: 'visit',
    icon: 'messages',
    category: '면회',
    title: '면회 안내',
    time: '어제 오전 11:57',
    body: '내일 오후 3시 면회가 예정되어 있습니다.\n면회 전 확인할 내용을 살펴보세요.',
    detail: {
      title: '면회 안내',
      lines: [
        '면회 일시 : 내일 오후 3시 (30분)',
        '장소 : 3병동 면회실',
        '면회 전 손 소독과 발열 체크를 진행해주세요.',
        '간식은 간호사실에 먼저 확인 후 전달해주세요.',
      ],
    },
  },
]

/* ───────────── 알림 · 면회 예약 모달 ───────────── */
export const NOTIFICATIONS = [
  { title: '점심 돌봄 기록이 올라왔어요', time: '14:35' },
  { title: '추가 검사 안내가 도착했어요', time: '3시간 전' },
  { title: '9월 2일 문의에 대한 답변이 도착했어요', time: '9시간 전' },
  { title: '내일 오후 3시 면회가 예정되어 있어요', time: '어제' },
]

/* ───────────── 문의 (IMAGE 06 ~ 14) ───────────── */
export const FAQ: { q: string; a: string }[] = [
  {
    q: '면회 시간은 언제인가요?',
    a: '평일·주말 모두 오후 2시부터 5시까지 면회할 수 있어요. 면회 예약 후 방문해주세요.',
  },
  {
    q: '간식이나 물품은 어떻게 전달하나요?',
    a: '1층 간호사실에 이름과 병실을 말씀해주시면 확인 후 전달해드려요. 필요한 물품은 함께ON에서 확인할 수 있어요.',
  },
  {
    q: '문의 답변은 언제 받을 수 있나요?',
    a: '담당자가 확인한 뒤 보통 2~3시간 안에 답변드려요. 진행 상황은 진행중인 문의에서 확인할 수 있어요.',
  },
  {
    q: '문의 답변은 언제 받을 수 있나요?',
    a: '야간·주말에 남긴 문의는 다음 근무 시간에 순서대로 확인해 답변드려요.',
  },
  {
    q: '면회 때 멍이나 상처가 보이면 어디에 문의하면 되나요?',
    a: '문의하기에서 발견한 부위와 시간을 남겨주세요. 담당 간호사가 원인과 조치 내용을 확인해 알려드려요.',
  },
]

export const FAQ_MORE: { q: string; a: string }[] = [
  { q: '가족도 같은 기록을 볼 수 있나요?', a: '초대 코드로 연결된 가족은 같은 돌봄 기록과 문의 내용을 함께 확인할 수 있어요.' },
  { q: '병원비 관련 문의는 어디로 하나요?', a: '문의하기에서 행정 관련 문의를 선택하면 원무과로 전달돼요.' },
]

export type StepState = 'done' | 'current' | 'todo'
export type InquiryStatus = '답변대기' | '확인중' | '답변 완료'

export const INQUIRY_STEPS = ['문의 접수', '담당자 확인', '답변 준비', '답변 완료']

/** 진행중인 문의 (IMAGE 11) */
export const ONGOING = [
  {
    id: 'knee',
    title: '무릎 검사 일정 관련 문의',
    date: '2026.09.08 문의',
    status: '답변대기' as InquiryStatus,
    current: 0,
    highlightLabel: 1,
    lastLabel: '문의 접수',
    lastTime: '2026.09.08 12:20',
    timelineId: 'bruise-progress',
  },
  {
    id: 'meal',
    title: '식사량이 줄어든 것 같아요',
    date: '2026.09.02 문의',
    status: '확인중' as InquiryStatus,
    current: 1,
    highlightLabel: 1,
    lastLabel: '병원 확인중',
    lastTime: '2026.09.02 09:40',
    timelineId: 'meal-progress',
  },
]

export const INQUIRY_SUMMARY = { ongoingCount: '1건', ongoingLabel: '확인대기', recentCount: '3건' }

/** 지난 문의 기록 (IMAGE 13) — 다른 보호자의 실명은 표시하지 않음 */
export type HistoryOwner = 'mine' | 'family'
export const HISTORY: { id: string; owner: HistoryOwner; date: string; status: InquiryStatus; body: string; timelineId: string }[] = [
  { id: 'h1', owner: 'family', date: '2026.08.26', status: '확인중', body: '무릎 검사 일정 관련 문의', timelineId: 'bruise-progress' },
  { id: 'h2', owner: 'mine', date: '2026.08.26', status: '확인중', body: '식사량 관련 문의', timelineId: 'meal-progress' },
  { id: 'h3', owner: 'mine', date: '2026.08.26', status: '답변 완료', body: '멍 자국 관련 문의', timelineId: 'bruise-done' },
  { id: 'h4', owner: 'family', date: '2026.08.26', status: '답변 완료', body: '복약관리 관련 문의', timelineId: 'medicine-done' },
]

/** 문의 타임라인 (IMAGE 10 · 12 · 14) */
export type TimelineNode =
  | { kind: 'subject' | 'note'; title: string; date: string; text: string; state: StepState }
  | { kind: 'card'; title: string; date: string; text: string; state: StepState }

export const INQUIRY_TIMELINES: Record<string, TimelineNode[]> = {
  // IMAGE 10
  'bruise-progress': [
    { kind: 'subject', title: '문의 접수', date: '2026.08.24 10:12', text: '문의 주제 : 이동 중 멍 확인', state: 'done' },
    { kind: 'card', title: '병원 확인중', date: '2026.08.24 12:20', text: '담당 간호사가 확인을 진행하고 있어요', state: 'current' },
  ],
  // IMAGE 12
  'meal-progress': [
    { kind: 'subject', title: '문의 접수', date: '2026.08.24 10:12', text: '문의 주제 : 식사량이 줄어든 것 같아요', state: 'done' },
    {
      kind: 'card',
      title: '병원 확인중',
      date: '2026.08.24 12:20',
      text: '담당 간호사가 문의 내용을 확인하고 있어요.\n답변 준비까지는 보통 2~3시간 정도 소요돼요.',
      state: 'current',
    },
  ],
  // IMAGE 14
  'bruise-done': [
    { kind: 'subject', title: '문의 접수', date: '2026.08.24 10:12', text: '문의 주제 : 이동 중 멍 확인', state: 'done' },
    {
      kind: 'card',
      title: '병원 확인중',
      date: '2026.08.24 12:20',
      text: '담당 간호사가 문의 내용을 확인하고 있어요.\n답변 준비까지는 보통 2~3시간 정도 소요돼요.',
      state: 'done',
    },
    {
      kind: 'note',
      title: '병원 확인 결과',
      date: '2026.08.24 14:45',
      text: '오늘 오전 이동 중 침상 변경 과정에서 생긴 멍을 확인했어요. 현재 통증은 없고 상태를 관찰하고 있습니다.',
      state: 'done',
    },
    { kind: 'note', title: '다음 계획', date: '2026.08.24 14:45', text: '상태 변화가 있으면 추가 안내드리겠습니다.', state: 'done' },
    { kind: 'card', title: '확인 완료', date: '2026.08.24 15:20', text: '해당 문의가 완료되었어요.', state: 'done' },
  ],
  // 지난 문의 기록의 '복약관리 관련 문의' (시안에 상세 화면이 없어 IMAGE 14 구조로 구성)
  'medicine-done': [
    { kind: 'subject', title: '문의 접수', date: '2026.08.26 09:30', text: '문의 주제 : 복약관리 관련 문의', state: 'done' },
    {
      kind: 'card',
      title: '병원 확인중',
      date: '2026.08.26 10:05',
      text: '담당 간호사가 문의 내용을 확인하고 있어요.\n답변 준비까지는 보통 2~3시간 정도 소요돼요.',
      state: 'done',
    },
    {
      kind: 'note',
      title: '병원 확인 결과',
      date: '2026.08.26 12:40',
      text: '처방된 약은 식후 30분에 맞춰 드리고 있어요. 복용 후 특이 반응은 없었습니다.',
      state: 'done',
    },
    { kind: 'note', title: '다음 계획', date: '2026.08.26 12:40', text: '처방 변경이 있으면 바로 안내드리겠습니다.', state: 'done' },
    { kind: 'card', title: '확인 완료', date: '2026.08.26 13:10', text: '해당 문의가 완료되었어요.', state: 'done' },
  ],
}

/* ───────────── 함께ON (IMAGE 15 · 16) ───────────── */
export const ROOM_STATUS = { label: '오늘의 병실', text: '평온한 하루가 이어지고 있어요' }

export type SupplyCategory = '물품' | '식품'
export const SUPPLIES: { name: string; qty: string; date: string; category: SupplyCategory; need: boolean }[] = [
  { name: '물티슈', qty: '4개', date: '09.08 (화)', category: '물품', need: false },
  { name: '성인용 기저귀', qty: '8개', date: '09.08 (화)', category: '물품', need: true },
  { name: '두유', qty: '1박스', date: '09.08 (화)', category: '식품', need: false },
  { name: '홍삼 스틱', qty: '2박스', date: '09.02 (토)', category: '식품', need: false },
  { name: '요거트', qty: '4개', date: '09.08 (화)', category: '식품', need: false },
  { name: '치약', qty: '3개', date: '09.08 (화)', category: '물품', need: false },
  { name: '면봉', qty: '1통', date: '10.08 (화)', category: '물품', need: false },
]
