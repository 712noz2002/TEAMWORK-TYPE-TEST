/**
 * 기록 화면 아이콘 — 첨부 HTML의 아이콘 SVG를 그대로 옮김 (색은 currentColor)
 */
export function RcChevron({ dir, size = 20 }: { dir: 'left' | 'right'; size?: number }) {
  return (
    <svg className="rc-ico" width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g transform={`rotate(${dir === 'left' ? 90 : -90} 12 12)`}>
        <path d="M17 10L12 15L7 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  )
}

export function RcChevronDown16() {
  return (
    <svg className="rc-ico" width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M11.3334 6.66667L8.00004 10L4.66671 6.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** 말풍선 글리프 (타임라인 아바타 · 빈 상태) */
export function ChatGlyph() {
  return (
    <svg viewBox="0 0 21 22" fill="none" aria-hidden="true">
      <path
        d="M10.1093 0.000233681C4.48937 0.0379259 -0.0374585 4.62318 0.000233681 10.2431C0.0171952 12.9287 1.07634 15.3617 2.78568 17.169L2.36542 20.55C2.2938 21.1267 2.87426 21.5206 3.38499 21.2417L6.37398 19.6171C7.56882 20.0977 8.87297 20.3616 10.2412 20.3521C15.8611 20.3144 20.3879 15.7292 20.3502 10.1093C20.3125 4.48937 15.7273 -0.0374585 10.1074 0.000233681H10.1093ZM10.2242 17.7212C6.05736 17.7495 2.65565 14.393 2.62926 10.2261C2.60099 6.05925 5.95748 2.65753 10.1243 2.63115C14.2912 2.60288 17.6929 5.95937 17.7193 10.1262C17.7476 14.2931 14.3911 17.6948 10.2242 17.7212Z"
        fill="currentColor"
      />
      <path
        d="M10.1753 15.2677C8.12293 15.2677 6.24963 14.2274 5.15844 12.4785C4.83618 11.9603 4.9926 11.2799 5.51086 10.9558C6.02725 10.6316 6.70948 10.7899 7.03363 11.3082C7.72151 12.4107 8.89374 13.0571 10.1998 13.0571C11.4738 13.0496 12.6403 12.3956 13.3169 11.3082C13.6392 10.7899 14.3214 10.6335 14.8397 10.9558C15.3579 11.278 15.5144 11.9603 15.1921 12.4785C14.1122 14.2105 12.2502 15.2546 10.2148 15.2677C10.2017 15.2677 10.1885 15.2677 10.1753 15.2677Z"
        fill="currentColor"
      />
    </svg>
  )
}
