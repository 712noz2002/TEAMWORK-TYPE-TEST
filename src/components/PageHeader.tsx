import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from './Icons'

/** 상세 화면 상단: 뒤로가기 + 가운데 제목 */
export default function PageHeader({ title, fallback = '/' }: { title: string; fallback?: string }) {
  const navigate = useNavigate()
  const back = () => {
    // 앱 안에서 이동해 온 경우 브라우저 뒤로가기와 동일하게, 바로 접속한 경우 상위 화면으로
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (idx > 0) navigate(-1)
    else navigate(fallback, { replace: true })
  }
  return (
    <header className="page-header">
      <button type="button" className="page-header__back pressable" onClick={back} aria-label="뒤로가기">
        <ChevronLeft size={24} stroke={2} />
      </button>
      <h1 className="page-header__title">{title}</h1>
    </header>
  )
}
