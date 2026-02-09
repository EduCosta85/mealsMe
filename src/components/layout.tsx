import type { ReactNode } from 'react'

interface LayoutProps {
  readonly children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-svh flex-col bg-surface text-on-surface">
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-28">
        {children}
      </main>
    </div>
  )
}
