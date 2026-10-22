/**
 * 화면별 상태바 색 (iOS 홈 화면 앱에서 상태바 배경으로 쓰이는 theme-color)
 * 상태바 글자색은 iOS가 배경 밝기에 맞춰 자동으로 흰색/검정으로 바꿉니다.
 */
const BRAND = '#427acf'
const ROOM = '#b99a80' // 함께ON 병실 사진 천장색

export function statusBarColorFor(pathname: string) {
  if (pathname === '/' || pathname === '/home') return BRAND
  if (pathname.startsWith('/together')) return ROOM
  if (pathname === '/record') return BRAND
  return '#ffffff'
}

export function setStatusBarColor(color: string) {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = 'theme-color'
    document.head.appendChild(meta)
  }
  if (meta.content !== color) meta.content = color
  document.documentElement.style.backgroundColor = color
  document.documentElement.style.setProperty('--status-bg', color)
}
