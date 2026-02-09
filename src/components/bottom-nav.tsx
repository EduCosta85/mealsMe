type Tab = 'today' | 'week' | 'shopping' | 'training'

interface BottomNavProps {
  readonly active: Tab
  readonly onChange: (tab: Tab) => void
}

const TABS: readonly { id: Tab; label: string; icon: string }[] = [
  { id: 'today', label: 'Hoje', icon: '📋' },
  { id: 'week', label: 'Semana', icon: '📊' },
  { id: 'shopping', label: 'Compras', icon: '🛒' },
  { id: 'training', label: 'Treino', icon: '🏋️' },
]

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl">
        {TABS.map((tab) => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
                isActive
                  ? 'text-primary-600'
                  : 'text-on-surface-muted hover:text-on-surface'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className={`font-medium ${isActive ? 'font-semibold' : ''}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
