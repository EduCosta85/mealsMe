type Tab = 'today' | 'week' | 'shopping' | 'training' | 'history'

interface BottomNavProps {
  readonly active: Tab
  readonly onChange: (tab: Tab) => void
}

const TABS: readonly { id: Tab; label: string; icon: string }[] = [
  { id: 'today', label: 'Hoje', icon: '📋' },
  { id: 'week', label: 'Semana', icon: '📊' },
  { id: 'shopping', label: 'Compras', icon: '🛒' },
  { id: 'training', label: 'Treino', icon: '🏋️' },
  { id: 'history', label: 'Histórico', icon: '📈' },
]

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 pb-safe backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-around px-2">
        {TABS.map((tab) => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
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
