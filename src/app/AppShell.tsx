import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { BookOpen, Menu, Sparkles, X } from 'lucide-react'
import { MODULES } from '@/data/modules'
import { ABBATECH } from '@/data/abbatech'
import { cn } from '@/shared/lib/utils'

export function AppShell() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-[280px] transform border-r border-rd-deep/10 transition lg:static lg:translate-x-0',
          'bg-[linear-gradient(180deg,#0b3d4a_0%,#0a2c35_100%)] text-white',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 px-5 py-5">
            <NavLink to="/" className="group block" onClick={() => setOpen(false)}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rd-teal/20 ring-1 ring-rd-teal/40">
                  <Sparkles className="h-5 w-5 text-rd-teal" />
                </div>
                <div>
                  <p className="font-brand text-lg font-bold tracking-tight">RDIntelligence</p>
                  <p className="text-xs text-white/60">Datos abiertos · RD</p>
                </div>
              </div>
            </NavLink>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            <NavLink
              to="/"
              end
              onClick={() => setOpen(false)}
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
                  onClick={() => setOpen(false)}
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
              onClick={() => setOpen(false)}
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
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-rd-deep/10 bg-white px-3 py-2 text-sm text-rd-deep lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-4 w-4" />
            Menú
          </button>
          <p className="hidden text-sm text-rd-slate lg:block">
            Información clara para ciudadanos · datos abiertos de República Dominicana
          </p>
          <a
            href={ABBATECH.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-rd-deep px-3 py-1.5 text-xs font-medium text-white hover:bg-rd-ocean"
          >
            {ABBATECH.name}
          </a>
          {open ? (
            <button type="button" className="lg:hidden" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          ) : null}
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>

        <footer className="border-t border-rd-deep/10 px-4 py-5 text-sm text-rd-slate lg:px-8">
          <p className="max-w-3xl leading-relaxed">
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
        </footer>
      </div>
    </div>
  )
}
