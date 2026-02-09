import { useRegisterSW } from 'virtual:pwa-register/react'

export function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  const handleClose = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  if (!offlineReady && !needRefresh) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg bg-primary-800 p-4 text-white shadow-lg">
      <p className="text-sm">
        {offlineReady
          ? 'App pronto para uso offline!'
          : 'Nova versao disponivel.'}
      </p>
      <div className="mt-3 flex gap-2">
        {needRefresh && (
          <button
            onClick={() => updateServiceWorker(true)}
            className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-primary-800 hover:bg-primary-50"
          >
            Atualizar
          </button>
        )}
        <button
          onClick={handleClose}
          className="rounded-md border border-white/30 px-3 py-1.5 text-xs font-medium hover:bg-white/10"
        >
          Fechar
        </button>
      </div>
    </div>
  )
}
