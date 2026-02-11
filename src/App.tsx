import { useState, useMemo } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from './components/layout'
import { BottomNav } from './components/bottom-nav'
import { ReloadPrompt } from './components/reload-prompt'
import { FloatingWaterButton } from './components/floating-water-button'
import { AgendaPage } from './pages/agenda'
import { WeekPage } from './pages/week'
import { ShoppingPage } from './pages/shopping'
import { TrainingPage } from './pages/training'
import { HistoryPage } from './pages/history'
import { useDailyTracker } from './hooks/use-daily-tracker'
import { getDayPlan } from './data/meal-plan'

// Finance Pages
import FinanceDashboard from './pages/finance/dashboard'
import AddExpense from './pages/finance/add-expense'
import History from './pages/finance/history'
import BudgetPage from './pages/finance/budget'
import CategoriesPage from './pages/finance/categories'
import IncomePage from './pages/finance/income'
import AnalyticsPage from './pages/finance/analytics'
import RecurringPage from './pages/finance/recurring'

// Auth Pages
import LoginPage from './pages/login'
import SettingsPage from './pages/settings'

type Tab = 'agenda' | 'week' | 'shopping' | 'training' | 'history' | 'finance' | 'settings'

/**
 * Main App Component with Tab-Based Navigation
 * 
 * Wraps existing tab navigation with React Router for finance pages.
 * Finance tab navigates to /finance route, other tabs remain tab-based.
 * Default tab is 'agenda' (timeline view of today's schedule).
 */
function TabBasedApp() {
  const [activeTab, setActiveTab] = useState<Tab>('agenda')
  const tracker = useDailyTracker()
  const plan = useMemo(() => getDayPlan(new Date()), [])
  const targetMl = plan.waterLiters * 1000

  return (
    <Layout>
      {activeTab === 'agenda' && <AgendaPage />}
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

/**
 * App Component with React Router Integration
 * 
 * Integrates React Router for finance pages while maintaining
 * existing tab-based navigation for other sections.
 * 
 * Routes:
 * - / - Tab-based navigation (agenda, week, shopping, training, history)
 * - /login - Public login page
 * - /finance/* - Protected finance routes (requires authentication)
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/mealsMe">
        <Routes>
          {/* Login Route (Public) */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Finance Routes (Protected) */}
          <Route
            path="/finance"
            element={
              <ProtectedRoute>
                <FinanceDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/add-expense"
            element={
              <ProtectedRoute>
                <AddExpense />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/budget"
            element={
              <ProtectedRoute>
                <BudgetPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/categories"
            element={
              <ProtectedRoute>
                <CategoriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/income"
            element={
              <ProtectedRoute>
                <IncomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/recurring"
            element={
              <ProtectedRoute>
                <RecurringPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          
          {/* Settings Route (Protected) */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          
          {/* Tab-Based Navigation (Protected) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <TabBasedApp />
              </ProtectedRoute>
            }
          />
          
          {/* Catch-all redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
