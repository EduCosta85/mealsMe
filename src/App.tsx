import { useState, useMemo } from 'react'
import { Layout } from './components/layout'
import { BottomNav } from './components/bottom-nav'
import { ReloadPrompt } from './components/reload-prompt'
import { FloatingWaterButton } from './components/floating-water-button'
import { TodayPage } from './pages/today'
import { WeekPage } from './pages/week'
import { ShoppingPage } from './pages/shopping'
import { TrainingPage } from './pages/training'
import { HistoryPage } from './pages/history'
import { useDailyTracker } from './hooks/use-daily-tracker'
import { getDayPlan } from './data/meal-plan'

type Tab = 'today' | 'week' | 'shopping' | 'training' | 'history'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('today')
  const tracker = useDailyTracker()
  const plan = useMemo(() => getDayPlan(new Date()), [])
  const targetMl = plan.waterLiters * 1000

  return (
    <Layout>
      {activeTab === 'today' && <TodayPage />}
      {activeTab === 'week' && <WeekPage />}
      {activeTab === 'shopping' && <ShoppingPage />}
      {activeTab === 'training' && <TrainingPage />}
      {activeTab === 'history' && <HistoryPage />}
      <FloatingWaterButton
        currentMl={tracker.progress.waterMl}
        targetMl={targetMl}
        onAdd={tracker.addWater}
      />
      <BottomNav active={activeTab} onChange={setActiveTab} />
      <ReloadPrompt />
    </Layout>
  )
}

export default App
