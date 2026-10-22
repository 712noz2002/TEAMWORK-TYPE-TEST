import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { IconSend } from '../components/Icons'
import { DEMO_REPLY_DELAY, demoReply, type ChatMessage } from '../data/mockResponder'
import { useStoredState } from '../lib/storage'

const SUGGESTIONS = ['오늘 식사는 어떠셨나요?', '오늘 특별한 변화가 있었나요?', '의료진에게 확인하고 싶은 게 있어요', '행정 관련 문의']

const uid = () => Math.random().toString(36).slice(2, 10)

export default function InquiryChat() {
  const navigate = useNavigate()
  const [messages, setMessages] = useStoredState<ChatMessage[]>('chat.messages', [])
  const [text, setText] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [typing, setTyping] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const empty = messages.length === 0

  // 보호자 메시지에 아직 답이 없으면 시연용 자동 응답
  const last = messages[messages.length - 1]
  useEffect(() => {
    if (!last || last.from !== 'guardian') return
    setTyping(true)
    const t = setTimeout(() => {
      setTyping(false)
      setMessages((prev) => [...prev, { id: uid(), ...demoReply(prev) }])
    }, DEMO_REPLY_DELAY)
    return () => clearTimeout(t)
  }, [last, setMessages])

  // 새 메시지가 오면 최신 위치로 스크롤
  const firstScroll = useRef(true)
  useLayoutEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: firstScroll.current ? 'auto' : 'smooth' })
    firstScroll.current = false
  }, [messages.length, typing])

  const send = () => {
    const t = text.trim()
    if (!t) return
    setMessages((prev) => [...prev, { id: uid(), from: 'guardian', text: t }])
    setText('')
    setExpanded(false)
  }

  // 추천 질문 패널: 위로 스와이프하면 펼침, 아래로 스와이프하면 접힘
  const swipe = useRef<number | null>(null)
  const onPanelDown = (e: React.PointerEvent) => {
    swipe.current = e.clientY
  }
  const onPanelUp = (e: React.PointerEvent) => {
    if (swipe.current == null) return
    const dy = e.clientY - swipe.current
    swipe.current = null
    if (dy < -24) setExpanded(true)
    else if (dy > 24) setExpanded(false)
  }

  return (
    <main className="page page--fixed chat">
      <PageHeader title="문의하기" fallback="/inquiry" />

      <div className="chat-list" ref={listRef}>
        {messages.map((m, i) => {
          const prev = messages[i - 1]
          const gapBig = prev && prev.from === 'demo-bot' && m.from === 'guardian'
          return (
            <div key={m.id} className={`bubble ${m.from === 'guardian' ? 'bubble--me' : 'bubble--bot'}${gapBig ? ' gap-big' : ''}`}>
              <p>{m.text}</p>
              {m.action === 'progress' && (
                <button type="button" className="bubble__action pressable" onClick={() => navigate('/inquiry/timeline/bruise-progress')}>
                  문의 진행 상황 확인
                </button>
              )}
            </div>
          )
        })}
        {typing && (
          <div className="bubble bubble--bot bubble--typing" aria-label="답변 작성 중">
            <i />
            <i />
            <i />
          </div>
        )}
      </div>

      <div className="chat-bottom">
        {empty && (
          <div
            className={`ask-panel${expanded ? ' is-expanded' : ''}`}
            onPointerDown={onPanelDown}
            onPointerUp={onPanelUp}
            onClick={(e) => {
              if (!expanded && !(e.target as HTMLElement).closest('button')) setExpanded(true)
            }}
          >
            <button
              type="button"
              className="ask-panel__handle"
              aria-label={expanded ? '추천 질문 접기' : '추천 질문 펼치기'}
              onClick={(e) => {
                e.stopPropagation()
                setExpanded(!expanded)
              }}
            />
            <p className="ask-panel__title">무엇이 궁금하신가요?</p>
            <p className="ask-panel__sub">편하게 말씀해주시면 확인해드릴게요.</p>
            <ul className="ask-panel__list" aria-hidden={!expanded}>
              {SUGGESTIONS.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    tabIndex={expanded ? 0 : -1}
                    onClick={(e) => {
                      e.stopPropagation()
                      setText(s)
                    }}
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <form
          className="chat-input"
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
        >
          <div className="chat-input__field">
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="궁금한 점을 적어주세요"
              enterKeyHint="send"
              autoComplete="off"
              onFocus={() => setTimeout(() => window.scrollTo(0, 0), 50)}
            />
          </div>
          <button type="submit" className="chat-input__send pressable" aria-label="보내기">
            <IconSend size={20} />
          </button>
        </form>
      </div>
    </main>
  )
}
