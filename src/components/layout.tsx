import type { ReactNode } from 'react'

interface LayoutProps {
  readonly children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-svh flex-col bg-surface text-on-surface">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-4">
          <h1 className="text-lg font-bold text-primary-600">
            🍽️ MealsMe
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-4 pb-20">
        {children}
      </main>
    </div>
  )
}
