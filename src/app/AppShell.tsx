import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { BookOpen, ChevronDown, ChevronUp, Menu, PanelLeftClose, Sparkles, X } from 'lucide-react'
import { MODULES } from '@/data/modules'
import { ABBATECH, LEGAL_DISCLAIMER } from '@/data/abbatech'
import { DayPlanFab } from '@/shared/components/DayPlanFab'
import { DayPlanModuleBanner } from '@/shared/components/DayPlanModuleBanner'
import { cn } from '@/shared/lib/utils'

function closeIfMobile(setOpen: (v: boolean) => void) {
  if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) {
    setOpen(false)
  }
}

function getInitialSidebarOpen() {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(min-width: 1024px)').matches
}

export function AppShell() {
  const [open, setOpen] = useState(getInitialSidebarOpen)
  const navRef = useRef<HTMLElement>(null)
  const [canScrollUp, setCanScrollUp] = useState(false)
  const [canScrollDown, setCanScrollDown] = useState(false)

  function updateNavScrollHints() {
    const el = navRef.current
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    const overflow = scrollHeight > clientHeight + 4
    setCanScrollUp(overflow && scrollTop > 8)
    setCanScrollDown(overflow && scrollTop + clientHeight < scrollHeight - 8)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const el = navRef.current
    if (!el) return

    updateNavScrollHints()
    el.addEventListener('scroll', updateNavScrollHints, { passive: true })

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateNavScrollHints) : null
    ro?.observe(el)

    window.addEventListener('resize', updateNavScrollHints)
    return () => {
      el.removeEventListener('scroll', updateNavScrollHints)
      ro?.disconnect()
      window.removeEventListener('resize', updateNavScrollHints)
    }
  }, [open])

  function scrollNav(dir: 'up' | 'down') {
    const el = navRef.current
    if (!el) return
    el.scrollBy({ top: dir === 'down' ? 140 : -140, behavior: 'smooth' })
  }

  return (
    <div className={cn('min-h-screen transition-[padding] duration-200', open && 'lg:pl-[280px]')}>
      <aside
        id="app-sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-rd-deep/10',
          'bg-[linear-gradient(180deg,#0b3d4a_0%,#0a2c35_100%)] text-white',
          'transform transition-transform duration-200 ease-out',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-2 border-b border-white/10 px-4 py-4">
          <NavLink to="/" className="group min-w-0 flex-1" onClick={() => closeIfMobile(setOpen)}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rd-teal/20 ring-1 ring-rd-teal/40">
                <Sparkles className="h-5 w-5 text-rd-teal" />
              </div>
              <div className="min-w-0">
                <p className="font-brand text-lg font-bold tracking-tight">RDIntelligence</p>
                <p className="text-xs text-white/60">Datos abiertos · RD</p>
              </div>
            </div>
          </NavLink>
          <button
            type="button"
            aria-label="Ocultar menú"
            onClick={() => setOpen(false)}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col">
          {canScrollUp ? (
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center">
              <div className="h-8 w-full bg-gradient-to-b from-[#0b3d4a] to-transparent" />
              <button
                type="button"
                aria-label="Ver módulos anteriores"
                onClick={() => scrollNav('up')}
                className="pointer-events-auto -mt-2 inline-flex items-center gap-1 rounded-full border border-white/20 bg-rd-deep/95 px-2.5 py-1 text-[11px] font-semibold text-white/90 shadow-lg backdrop-blur-sm"
              >
                <ChevronUp className="h-3.5 w-3.5 animate-bounce" />
                Más arriba
              </button>
            </div>
          ) : null}

          <nav
            ref={navRef}
            aria-label="Módulos de RDIntelligence"
            className="sidebar-nav min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-3"
          >
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
              Menú · desliza para ver más
            </p>
            <NavLink
              to="/"
              end
              onClick={() => closeIfMobile(setOpen)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition',
                  isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white',
                )
              }
            >
              Inicio
            </NavLink>
            {MODULES.map((m) => {
              const Icon = m.icon
              return (
                <NavLink
                  key={m.id}
                  to={m.path}
                  onClick={() => closeIfMobile(setOpen)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition',
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white',
                    )
                  }
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-80" />
                  <span className="truncate">{m.short}</span>
                  {!m.live ? (
                    <span className="ml-auto rounded bg-white/10 px-1.5 py-0.5 text-[10px]">demo</span>
                  ) : null}
                </NavLink>
              )
            })}
            <NavLink
              to="/fuentes"
              onClick={() => closeIfMobile(setOpen)}
              className={({ isActive }) =>
                cn(
                  'mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition',
                  isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white',
                )
              }
            >
              <BookOpen className="h-4 w-4" />
              Fuentes de datos
            </NavLink>
            <div className="h-3" aria-hidden />
          </nav>

          {canScrollDown ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center">
              <div className="h-10 w-full bg-gradient-to-t from-[#0a2c35] via-[#0a2c35]/90 to-transparent" />
              <button
                type="button"
                aria-label="Ver más módulos abajo"
                onClick={() => scrollNav('down')}
                className="pointer-events-auto -mt-6 mb-2 inline-flex items-center gap-1 rounded-full border border-rd-teal/40 bg-rd-ocean px-3 py-1.5 text-[11px] font-semibold text-white shadow-[0_8px_24px_rgb(0_0_0_/_0.35)]"
              >
                Más módulos
                <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
              </button>
            </div>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-white/10 px-4 py-3 text-xs leading-relaxed text-white/65">
          <p>
            Desarrollado por{' '}
            <a
              href={ABBATECH.url}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-rd-teal underline-offset-2 hover:underline"
            >
              {ABBATECH.name}
            </a>
          </p>
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-rd-deep/10 bg-white/70 px-4 py-3 backdrop-blur-md lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-expanded={open}
              aria-controls="app-sidebar"
              aria-label={open ? 'Ocultar menú' : 'Mostrar menú'}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl border border-rd-deep/10 bg-white px-3 py-2 text-sm text-rd-deep transition hover:border-rd-teal hover:text-rd-ocean"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              <span>{open ? 'Ocultar' : 'Menú'}</span>
            </button>
            <p className="hidden truncate text-sm text-rd-slate sm:block">
              Información clara para ciudadanos · datos abiertos de República Dominicana
            </p>
          </div>
          <a
            href={ABBATECH.url}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-full bg-rd-deep px-3 py-1.5 text-xs font-medium text-white hover:bg-rd-ocean"
          >
            {ABBATECH.name}
          </a>
        </header>

        <main className="flex-1 px-4 py-6 pb-24 lg:px-8 lg:py-8 lg:pb-24">
          <DayPlanModuleBanner />
          <Outlet />
        </main>

        <footer className="border-t border-rd-deep/10 px-4 py-5 text-sm text-rd-slate lg:px-8">
          <div className="max-w-3xl space-y-3 leading-relaxed">
            <p>
              {ABBATECH.disclaimer}{' '}
              <a
                href={ABBATECH.url}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-rd-ocean underline-offset-2 hover:underline"
              >
                Visitar {ABBATECH.name}
              </a>
            </p>
            <p>{LEGAL_DISCLAIMER.dataSources}</p>
            <p className="text-xs text-rd-slate/90">{LEGAL_DISCLAIMER.trademarks}</p>
          </div>
        </footer>
      </div>

      <DayPlanFab />
    </div>
  )
}
