import type { ReactNode } from 'react'
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react'

export function LoadingState({ label = 'Cargando datos abiertos…' }: { label?: string }) {
  return (
    <div className="panel flex min-h-48 items-center justify-center gap-3 p-8 text-rd-slate">
      <Loader2 className="h-5 w-5 animate-spin text-rd-ocean" />
      <span>{label}</span>
    </div>
  )
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="panel flex min-h-48 flex-col items-center justify-center gap-3 p-8 text-center">
      <AlertTriangle className="h-6 w-6 text-rd-coral" />
      <p className="max-w-md text-sm text-rd-slate">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-full bg-rd-deep px-4 py-2 text-sm font-medium text-white transition hover:bg-rd-ocean"
        >
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </button>
      ) : null}
    </div>
  )
}

export function Disclaimer({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-900">
      {children}
    </div>
  )
}
