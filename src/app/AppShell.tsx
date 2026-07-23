import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { BookOpen, Menu, PanelLeftClose, Sparkles, X } from 'lucide-react'
import { MODULES } from '@/data/modules'
import { ABBATECH, LEGAL_DISCLAIMER } from '@/data/abbatech'
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

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
        <div className="flex items-start justify-between gap-2 border-b border-white/10 px-4 py-4">
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

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
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
        </nav>

        <div className="border-t border-white/10 px-4 py-4 text-xs leading-relaxed text-white/65">
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

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
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
    </div>
  )
}
