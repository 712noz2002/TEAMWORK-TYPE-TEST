import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  /** 접근성용 제목 */
  label?: string
}

const ANIM_MS = 280

/**
 * 하단에서 올라오는 바텀시트
 * - 뒤 화면 딤 처리, 딤 영역 탭하면 닫힘
 * - 아래로 스와이프하면 닫힘
 */
export default function Sheet({ open, onClose, children, className = '', label }: Props) {
  const [mounted, setMounted] = useState(open)
  const [shown, setShown] = useState(false)
  const panel = useRef<HTMLDivElement>(null)
  const drag = useRef<{ y: number; t: number; dy: number; active: boolean } | null>(null)

  useEffect(() => {
    if (open) {
      setMounted(true)
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)))
      return () => cancelAnimationFrame(id)
    }
    setShown(false)
    const t = setTimeout(() => setMounted(false), ANIM_MS)
    return () => clearTimeout(t)
  }, [open])

  if (!mounted) return null

  const setY = (y: number, animate: boolean) => {
    const el = panel.current
    if (!el) return
    el.style.transition = animate ? '' : 'none'
    el.style.transform = y ? `translate3d(0, ${y}px, 0)` : ''
  }

  const onPointerDown = (e: React.PointerEvent) => {
    // 시트 안쪽 스크롤 영역이 위로 스크롤된 상태에서는 스와이프 닫기를 시작하지 않음
    const scroller = (e.target as HTMLElement).closest('.sheet__scroll') as HTMLElement | null
    if (scroller && scroller.scrollTop > 0) return
    drag.current = { y: e.clientY, t: performance.now(), dy: 0, active: true }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d?.active) return
    d.dy = Math.max(0, e.clientY - d.y)
    if (d.dy > 4) setY(d.dy, false)
  }
  const onPointerUp = () => {
    const d = drag.current
    drag.current = null
    if (!d) return
    const v = d.dy / Math.max(1, performance.now() - d.t)
    if (d.dy > 90 || (d.dy > 24 && v > 0.5)) {
      setY(0, true)
      onClose()
    } else {
      setY(0, true)
    }
  }

  return createPortal(
    <div className={`sheet-root${shown ? ' is-open' : ''}`} role="dialog" aria-modal="true" aria-label={label}>
      <div className="sheet-dim" onClick={onClose} />
      <div
        ref={panel}
        className={`sheet ${className}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {children}
      </div>
    </div>,
    document.getElementById('app-shell') ?? document.body,
  )
}

/** 일반 안내용 시트 내용 (제목 + 본문 + 버튼) */
export function InfoSheet({
  open,
  onClose,
  title,
  children,
  action,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  action?: { label: string; onClick: () => void }
}) {
  return (
    <Sheet open={open} onClose={onClose} label={title} className="sheet--info">
      <div className="sheet__handle" />
      <h2 className="sheet__title">{title}</h2>
      <div className="sheet__scroll">{children}</div>
      <button
        type="button"
        className="sheet__button pressable"
        onClick={() => {
          if (action) action.onClick()
          else onClose()
        }}
      >
        {action?.label ?? '확인'}
      </button>
    </Sheet>
  )
}
