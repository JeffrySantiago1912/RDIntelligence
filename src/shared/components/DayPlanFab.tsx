import { Link, useLocation } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

/** Acceso flotante permanente a “Qué hacer hoy?”. */
export function DayPlanFab() {
  const { pathname } = useLocation()
  const onPage = pathname === '/que-hacer'

  return (
    <div className="pointer-events-none fixed bottom-5 right-4 z-50 sm:bottom-6 sm:right-6">
      <span
        aria-hidden
        className={cn(
          'absolute inset-0 -m-1 rounded-full bg-rd-teal/35',
          'animate-[fab-ping_2.4s_cubic-bezier(0,0,0.2,1)_infinite]',
          onPage && 'hidden',
        )}
      />
      <Link
        to="/que-hacer"
        aria-label="Qué hacer hoy?"
        className={cn(
          'dayplan-fab group pointer-events-auto relative inline-flex items-center gap-2.5 overflow-hidden',
          'rounded-full px-4 py-3 text-white',
          'bg-[linear-gradient(135deg,#0b3d4a_0%,#137a8a_48%,#1aa6a0_100%)]',
          'shadow-[0_12px_36px_rgb(11_61_74_/_0.38)]',
          'ring-1 ring-white/25',
          'transition-all duration-300 ease-out',
          'hover:-translate-y-1 hover:scale-[1.03] hover:shadow-[0_18px_44px_rgb(19_122_138_/_0.45)]',
          'active:translate-y-0 active:scale-[0.98]',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rd-teal',
          'animate-[fab-float_3.2s_ease-in-out_infinite]',
          onPage && 'ring-2 ring-rd-teal ring-offset-2 ring-offset-rd-sand animate-none',
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent_20%,rgb(255_255_255_/_0.28)_50%,transparent_80%)] transition-transform duration-700 group-hover:translate-x-full"
        />
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30 transition duration-300 group-hover:rotate-12">
          <Compass className="h-[1.125rem] w-[1.125rem] text-rd-teal drop-shadow-sm transition duration-500 group-hover:rotate-[25deg]" />
        </span>
        <span className="relative pr-1 font-display text-sm font-bold tracking-tight">Qué hacer hoy?</span>
      </Link>
    </div>
  )
}
