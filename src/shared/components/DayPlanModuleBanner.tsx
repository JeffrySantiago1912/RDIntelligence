import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, Compass } from 'lucide-react'

/**
 * Banner compacto de “Qué hacer hoy?” para módulos.
 * No se muestra en Inicio ni en la propia página de recomendaciones.
 */
export function DayPlanModuleBanner() {
  const { pathname } = useLocation()
  if (pathname === '/' || pathname === '/que-hacer') return null

  return (
    <Link
      to="/que-hacer"
      className="panel group mb-6 flex flex-wrap items-center justify-between gap-3 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-rd-teal/40 hover:shadow-[0_14px_36px_rgb(11_61_74_/_0.12)]"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rd-coral to-rd-amber text-white shadow-sm transition duration-300 group-hover:scale-105">
          <Compass className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="font-display font-bold text-rd-ink">Qué hacer hoy?</p>
          <p className="text-sm text-rd-slate">
            Recomendaciones orientativas de parques y playas según el clima.
          </p>
        </div>
      </div>
      <span className="inline-flex items-center gap-1 text-sm font-semibold text-rd-ocean">
        Abrir
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}
