import { useLocation, useNavigate } from 'react-router-dom'
import { IconChat, IconHome, IconRecord, IconUsers } from './Icons'

const TABS = [
  { path: '/', label: '홈', Icon: IconHome, match: (p: string) => p === '/' },
  { path: '/record', label: '기록', Icon: IconRecord, match: (p: string) => p.startsWith('/record') },
  { path: '/inquiry', label: '문의', Icon: IconChat, match: (p: string) => p.startsWith('/inquiry') },
  { path: '/together', label: '함께ON', Icon: IconUsers, match: (p: string) => p.startsWith('/together') },
]

export default function TabBar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="tabbar" aria-label="주요 메뉴">
      {TABS.map(({ path, label, Icon, match }) => {
        const active = match(pathname)
        return (
          <button
            key={path}
            type="button"
            className={`tabbar__item${active ? ' is-active' : ''}`}
            aria-current={active ? 'page' : undefined}
            onClick={() => {
              if (pathname !== path) navigate(path)
            }}
          >
            <Icon size={22} stroke={1.5} />
            <span>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
