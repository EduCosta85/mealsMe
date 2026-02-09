import { useState } from 'react'
import { Layout } from './components/layout'
import { BottomNav } from './components/bottom-nav'
import { ReloadPrompt } from './components/reload-prompt'
import { TodayPage } from './pages/today'
import { WeekPage } from './pages/week'
import { ShoppingPage } from './pages/shopping'
import { TrainingPage } from './pages/training'

type Tab = 'today' | 'week' | 'shopping' | 'training'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('today')

  return (
    <Layout>
      {activeTab === 'today' && <TodayPage />}
      {activeTab === 'week' && <WeekPage />}
      {activeTab === 'shopping' && <ShoppingPage />}
      {activeTab === 'training' && <TrainingPage />}
      <BottomNav active={activeTab} onChange={setActiveTab} />
      <ReloadPrompt />
    </Layout>
  )
}

export default App
