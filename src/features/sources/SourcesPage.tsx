import { DATA_SOURCES, MODULES } from '@/data/modules'
import { LEGAL_DISCLAIMER } from '@/data/abbatech'
import { SectionHeader } from '@/shared/components/SectionHeader'
import { ExternalLink } from 'lucide-react'

export function SourcesPage() {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Fuentes de datos"
        description="Documentación sencilla de dónde sale cada información en RDIntelligence."
      />

      <section className="rounded-2xl border border-rd-deep/10 bg-amber-50/80 p-5 text-sm leading-relaxed text-amber-950">
        <h2 className="font-display text-lg font-bold text-rd-ink">Aviso legal</h2>
        <p className="mt-2">{LEGAL_DISCLAIMER.dataSources}</p>
        <p className="mt-3 text-xs text-amber-900/80">{LEGAL_DISCLAIMER.trademarks}</p>
      </section>

      <div className="grid gap-4">
        {DATA_SOURCES.map((s) => (
          <article key={s.id} className="panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold text-rd-ink">{s.name}</h2>
                <p className="mt-1 text-sm text-rd-slate">{s.notes}</p>
              </div>
              {s.url !== '#' ? (
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full bg-rd-deep px-3 py-1.5 text-xs font-medium text-white"
                >
                  Abrir fuente
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {s.usedBy.map((u) => (
                <span
                  key={u}
                  className="rounded-full border border-rd-deep/10 bg-rd-mist/70 px-2.5 py-1 text-xs text-rd-deep"
                >
                  {u}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      <section className="panel-strong p-6">
        <h2 className="font-display text-xl font-bold">Mapa módulo → fuente</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-rd-deep/10 text-xs uppercase tracking-wider text-rd-slate">
                <th className="py-2 pr-3">Módulo</th>
                <th className="py-2 pr-3">Live</th>
                <th className="py-2">Cómo se obtiene</th>
              </tr>
            </thead>
            <tbody>
              {MODULES.map((m) => (
                <tr key={m.id} className="border-b border-rd-deep/5">
                  <td className="py-3 pr-3 font-medium">{m.title}</td>
                  <td className="py-3 pr-3">{m.live ? 'Sí' : 'Demo'}</td>
                  <td className="py-3 text-rd-slate">{m.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-rd-deep/10 bg-white/60 p-6 text-sm leading-relaxed text-rd-slate">
        <h2 className="font-display text-lg font-bold text-rd-ink">Limitaciones honestas</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>ONAMET, COE, INDRHI, EDE e IDE-RD no exponen APIs REST públicas estables con CORS.</li>
          <li>Sargazo, apagones y tráfico usan heurísticas transparentes hasta integrar feeds oficiales.</li>
          <li>
            El JSON directo de NHC bloquea CORS; huracanes usan NASA EONET (CORS abierto) con enlaces a
            NHC/JTWC.
          </li>
          <li>NASA FIRMS (incendios satélite) es gratis con registro de MAP_KEY — pendiente de integrar.</li>
        </ul>
      </section>
    </div>
  )
}
