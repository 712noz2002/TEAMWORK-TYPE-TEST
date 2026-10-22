/**
 * ⚠️ 시연용 자동 응답 (DEMO ONLY)
 * ─────────────────────────────────────────────
 * 이 파일의 응답은 졸업전시 시연을 위해 미리 작성한 문장입니다.
 * 실제 의료진·병원 시스템과 연결되지 않으며, 의료적 판단을 제공하지 않습니다.
 */

export type ChatMessage = {
  id: string
  from: 'guardian' | 'demo-bot'
  text: string
  /** true면 말풍선 안에 '문의 진행 상황 확인' 버튼 표시 */
  action?: 'progress'
}

type Topic = 'bruise' | 'meal' | 'change' | 'medical' | 'admin' | 'general'

const BODY_PARTS = ['어깨', '팔꿈치', '손목', '손등', '팔', '다리', '무릎', '발목', '얼굴', '이마', '등', '허리', '엉덩이']

function detectTopic(text: string): Topic {
  if (/멍|상처|다치|넘어|긁|부었|붓/.test(text)) return 'bruise'
  if (/식사|밥|드셨|먹|식사량|간식/.test(text)) return 'meal'
  if (/변화|특별|달라|이상/.test(text)) return 'change'
  if (/의료진|의사|간호|검사|약|통증|아프/.test(text)) return 'medical'
  if (/행정|병원비|서류|원무|면회 예약|비용|결제/.test(text)) return 'admin'
  return 'general'
}

function findPart(texts: string[]) {
  for (const t of [...texts].reverse()) {
    const p = BODY_PARTS.find((b) => t.includes(b))
    if (p) return p
  }
  return null
}

/**
 * 대화 흐름: 보호자가 말을 걸면 → 상황을 묻고 → 담당자 확인으로 연결합니다.
 * 같은 주제 안에서 몇 번째 질문인지에 따라 답을 고릅니다.
 */
export function demoReply(history: ChatMessage[]): Omit<ChatMessage, 'id'> {
  // 마지막 '진행 상황 확인' 이후의 대화만 한 묶음으로 봅니다.
  let start = 0
  history.forEach((m, i) => {
    if (m.action === 'progress') start = i + 1
  })
  const turn = history.slice(start).filter((m) => m.from === 'guardian')
  const texts = turn.map((m) => m.text)
  const first = texts[0] ?? ''
  const topic = detectTopic(first)
  const n = turn.length

  const bot = (text: string, action?: 'progress'): Omit<ChatMessage, 'id'> => ({ from: 'demo-bot', text, action })

  switch (topic) {
    case 'bruise': {
      if (n === 1) return bot('걱정되셨겠어요. 정확한 상황을 확인해 담당자에게 전달할게요. 멍은 언제 발견하셨나요?')
      if (n === 2) {
        const part = findPart(texts)
        return bot(part ? `멍은 ${part}의 어느 부위에 있었나요?` : '멍은 어느 부위에 있었나요?')
      }
      const part = findPart(texts.slice(1)) ?? findPart(texts) ?? '말씀하신 부위'
      const when = texts.some((t) => t.includes('오늘')) ? '오늘 발견된' : '말씀하신'
      return bot(
        `네, 바로 담당자에게 확인할게요. ${when} ${part} 근처 멍의 원인과 조치 내용을 확인해 알려드리겠습니다.`,
        'progress',
      )
    }
    case 'meal':
      if (n === 1)
        return bot('오늘 아침은 1/2, 점심은 1/2 정도 드셨어요. 평소와 비슷한 양이에요. 더 궁금하신 점이 있으신가요?')
      return bot('네, 식사 상황을 담당자에게 한 번 더 확인해 알려드릴게요.', 'progress')
    case 'change':
      if (n === 1)
        return bot('현재까지 평소와 다른 변화는 확인되지 않았어요. 점심 식사까지 평소처럼 이어졌어요. 걱정되는 부분이 있으신가요?')
      return bot('말씀해주신 내용을 담당자에게 전달해 확인한 뒤 알려드릴게요.', 'progress')
    case 'medical':
      if (n === 1) return bot('어떤 내용을 의료진에게 확인하고 싶으신가요? 편하게 적어주시면 정리해서 전달할게요.')
      return bot('네, 담당 간호사에게 전달했어요. 확인되는 대로 진행 상황을 알려드릴게요.', 'progress')
    case 'admin':
      if (n === 1) return bot('어떤 행정 업무가 궁금하신가요? 병원비, 서류 발급, 면회 예약 등 편하게 말씀해주세요.')
      return bot('원무과 담당자에게 전달했어요. 확인되는 대로 안내드릴게요.', 'progress')
    default:
      if (n === 1) return bot('말씀해주셔서 감사해요. 조금 더 자세히 알려주시면 정확하게 확인해 전달할게요.')
      return bot('네, 담당자에게 확인을 요청했어요. 진행 상황은 아래에서 확인할 수 있어요.', 'progress')
  }
}

/** 응답을 보내기까지 기다리는 시간(ms) — 실제 대화처럼 보이게 */
export const DEMO_REPLY_DELAY = 900
