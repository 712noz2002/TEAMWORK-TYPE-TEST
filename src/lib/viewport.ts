/**
 * 모바일 앱처럼 보이게 하기 위한 뷰포트 처리
 * - iOS 키보드가 열리면 visualViewport 높이에 맞춰 앱 셸 높이를 줄여 입력창이 가려지지 않게 함
 * - 핀치 줌 / 더블탭 확대 방지
 */
export function installViewportHandlers() {
  const root = document.documentElement
  const vv = window.visualViewport

  const update = () => {
    const h = vv ? vv.height : window.innerHeight
    const top = vv ? vv.offsetTop : 0
    root.style.setProperty('--app-h', `${Math.round(h)}px`)
    root.style.setProperty('--app-top', `${Math.round(top)}px`)
    // 키보드가 열렸는지: 레이아웃 높이 대비 보이는 높이가 크게 줄어든 경우
    const keyboard = window.innerHeight - h > 120
    root.classList.toggle('kb-open', keyboard)
  }

  update()
  vv?.addEventListener('resize', update)
  vv?.addEventListener('scroll', update)
  window.addEventListener('resize', update)
  window.addEventListener('orientationchange', () => setTimeout(update, 300))

  // iOS 핀치 줌 방지
  const prevent = (e: Event) => e.preventDefault()
  document.addEventListener('gesturestart', prevent, { passive: false })
  document.addEventListener('gesturechange', prevent, { passive: false })

  // 더블탭 확대 방지
  let lastTouch = 0
  document.addEventListener(
    'touchend',
    (e) => {
      const now = Date.now()
      if (now - lastTouch < 300) {
        const t = e.target as HTMLElement
        if (!t.closest('input, textarea')) e.preventDefault()
      }
      lastTouch = now
    },
    { passive: false },
  )

  // standalone(홈 화면 앱) 여부를 CSS에서 쓸 수 있게 표시
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  root.classList.toggle('is-standalone', standalone)
}
