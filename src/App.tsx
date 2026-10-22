import { useEffect, useLayoutEffect, useRef } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import TabBar from './components/TabBar'
import { setStatusBarColor, statusBarColorFor } from './lib/statusBar'
import { resetDemo } from './lib/storage'
import Home from './pages/Home'
import Record from './pages/Record'
import CareTimeline from './pages/CareTimeline'
import Inquiry from './pages/Inquiry'
import InquiryChat from './pages/InquiryChat'
import InquiryOngoing from './pages/InquiryOngoing'
import InquiryHistory from './pages/InquiryHistory'
import InquiryTimeline from './pages/InquiryTimeline'
import Together from './pages/Together'

const depth = (p: string) => (p === '/' ? 0 : p.split('/').filter(Boolean).length)

function Reset() {
  useEffect(() => resetDemo(), [])
  return null
}

export default function App() {
  const location = useLocation()
  const prev = useRef(location.pathname)
  const pageRef = useRef<HTMLDivElement>(null)

  // 화면 전환 방향: 하위 화면으로 들어가면 오른쪽에서, 돌아오면 왼쪽에서, 탭 이동은 페이드
  const from = prev.current
  const to = location.pathname
  const dir = depth(to) > depth(from) ? 'push' : depth(to) < depth(from) ? 'pop' : 'fade'

  useLayoutEffect(() => {
    prev.current = location.pathname
    setStatusBarColor(statusBarColorFor(location.pathname))
  }, [location.pathname])

  return (
    <div id="app-shell" className="app">
      <div
        ref={pageRef}
        key={location.pathname}
        // 함께ON · 기록: 사진/파란 바탕이 상태바(노치) 뒤까지 이어지도록 화면 맨 위부터 그림
        className={`page-wrap page-anim-${from === to ? 'none' : dir}${to.startsWith('/together') || to === '/record' ? ' is-fullbleed' : ''}`}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/record" element={<Record />} />
          <Route path="/record/timeline" element={<CareTimeline />} />
          <Route path="/record/timeline/:date" element={<CareTimeline />} />
          <Route path="/inquiry" element={<Inquiry />} />
          <Route path="/inquiry/new" element={<InquiryChat />} />
          <Route path="/inquiry/ongoing" element={<InquiryOngoing />} />
          <Route path="/inquiry/history" element={<InquiryHistory />} />
          <Route path="/inquiry/timeline/:id" element={<InquiryTimeline />} />
          <Route path="/together" element={<Together />} />
          {/* 전시용 데모 초기화: /reset 으로 접속하면 체험 기록을 지우고 홈으로 이동 */}
          <Route path="/reset" element={<Reset />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <TabBar />
    </div>
  )
}
