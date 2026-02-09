import { useState } from 'react'
import { Layout } from './components/layout'
import { BottomNav } from './components/bottom-nav'
import { ReloadPrompt } from './components/reload-prompt'
import { TodayPage } from './pages/today'
import { WeekPage } from './pages/week'
import { ShoppingPage } from './pages/shopping'
import { TrainingPage } from './pages/training'
import { HistoryPage } from './pages/history'

type Tab = 'today' | 'week' | 'shopping' | 'training' | 'history'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('today')

  return (
    <Layout>
      {activeTab === 'today' && <TodayPage />}
      {activeTab === 'week' && <WeekPage />}
      {activeTab === 'shopping' && <ShoppingPage />}
      {activeTab === 'training' && <TrainingPage />}
      {activeTab === 'history' && <HistoryPage />}
      <BottomNav active={activeTab} onChange={setActiveTab} />
      <ReloadPrompt />
    </Layout>
  )
}

export default App
