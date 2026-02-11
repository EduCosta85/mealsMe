import { useNavigate, useLocation } from 'react-router-dom'

type Tab = 'today' | 'week' | 'shopping' | 'training' | 'history' | 'finance' | 'settings'

interface BottomNavProps {
  readonly active: Tab
  readonly onChange: (tab: Tab) => void
}

const TABS: readonly { id: Tab; label: string; icon: string }[] = [
  { id: 'today', label: 'Hoje', icon: '📋' },
  { id: 'week', label: 'Semana', icon: '📊' },
  { id: 'shopping', label: 'Compras', icon: '🛒' },
  { id: 'finance', label: 'Finanças', icon: '💰' },
  { id: 'training', label: 'Treino', icon: '🏋️' },
  { id: 'history', label: 'Histórico', icon: '📈' },
  { id: 'settings', label: 'Config', icon: '⚙️' },
]

export function BottomNav({ active, onChange }: BottomNavProps) {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Determine active tab from location
  // Note: pathname is relative to basename, so it will be '/finance' not '/mealsMe/finance'
  const isFinanceRoute = location.pathname.startsWith('/finance') || location.pathname === '/finance'
  const isSettingsRoute = location.pathname.startsWith('/settings') || location.pathname === '/settings'
  const currentTab = isFinanceRoute ? 'finance' : isSettingsRoute ? 'settings' : active

  const handleTabClick = (tab: Tab) => {
    if (tab === 'finance') {
      // Navigate to finance route
      navigate('/finance')
    } else if (tab === 'settings') {
      // Navigate to settings route
      navigate('/settings')
    } else if (isFinanceRoute || isSettingsRoute) {
      // If on finance or settings route, go back to home first
      navigate('/')
      // Then set the tab after a small delay to ensure navigation completes
      setTimeout(() => onChange(tab), 10)
    } else {
      // Normal tab change
      onChange(tab)
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 pb-safe backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-around px-2">
        {TABS.map((tab) => {
          const isActive = currentTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1 transition-all active:scale-95 ${
                isActive ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div
                className={`flex h-8 w-14 items-center justify-center rounded-full transition-colors ${
                  isActive ? 'bg-primary-100' : 'bg-transparent'
                }`}
              >
                <span className="text-xl leading-none">{tab.icon}</span>
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
