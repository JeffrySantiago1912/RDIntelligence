import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  Compass,
  Loader2,
  MapPin,
  Navigation,
  Sparkles,
  Trees,
  Umbrella,
  Waves,
} from 'lucide-react'
import {
  defaultDayPlanFilters,
  loadDayPlan,
  parseDayPlanQuery,
  type DayPlanFilters,
  type DayRecommendation,
  type PlaceKind,
} from '@/shared/lib/dayPlan'
import { useAsyncData } from '@/shared/hooks/useAsyncData'
import { SectionHeader } from '@/shared/components/SectionHeader'
import { LoadingState, ErrorState, Disclaimer } from '@/shared/components/States'
import { WeatherIcon } from '@/shared/components/WeatherIcon'
import { formatNumber } from '@/shared/lib/utils'
import { googleMapsDirectionsUrl, googleMapsPlaceUrl } from '@/shared/lib/navigationLinks'
import { TIPS } from '@/data/tips'
import { InfoTip } from '@/shared/components/InfoTip'
import { cn } from '@/shared/lib/utils'

const DAY_CHIPS = [
  { offset: 0, short: 'Hoy' },
  { offset: 1, short: 'Mañana' },
  { offset: 2, short: '+2 días' },
  { offset: 3, short: '+3 días' },
  { offset: 4, short: '+4 días' },
]

const INTENT_CHIPS: {
  id: string
  label: string
  apply: (f: DayPlanFilters) => DayPlanFilters
}[] = [
  {
    id: 'all',
    label: 'Todo',
    apply: (f) => ({ ...f, kinds: 'all', preferFree: false, preferFamily: false, preferCovered: false }),
  },
  {
    id: 'parks',
    label: 'Parques',
    apply: (f) => ({ ...f, kinds: ['park'] as PlaceKind[] }),
  },
  {
    id: 'beaches',
    label: 'Playas',
    apply: (f) => ({ ...f, kinds: ['beach'] as PlaceKind[] }),
  },
  {
    id: 'free',
    label: 'Gratis',
    apply: (f) => ({ ...f, preferFree: true, kinds: f.kinds === 'all' ? (['park'] as PlaceKind[]) : f.kinds }),
  },
  {
    id: 'family',
    label: 'Familia',
    apply: (f) => ({ ...f, preferFamily: true }),
  },
  {
    id: 'rain',
    label: 'Si llueve',
    apply: (f) => ({ ...f, preferCovered: true, kinds: ['park'] as PlaceKind[] }),
  },
]

const PROMPT_EXAMPLES = [
  'playas mañana',
  'parques gratis hoy',
  'qué hacer en Santo Domingo',
  'familia +2 días',
  'si llueve acuario o cuevas',
]

const LOADING_STEPS = [
  'Consultando clima por zonas de RD…',
  'Evaluando playas y oleaje…',
  'Revisando parques y horarios…',
  'Armando el ranking del día…',
]

function WaveLoadingText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={cn('dayplan-wave-text inline-flex flex-wrap', className)} aria-hidden>
      {Array.from(text).map((char, i) => (
        <span
          key={`${char}-${i}`}
          className="dayplan-wave-char inline-block"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  )
}

function DayPlanLoadingHero() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setStep((s) => (s + 1) % LOADING_STEPS.length)
    }, 1500)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div
      className="flex w-full flex-wrap items-start justify-between gap-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="max-w-2xl">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-rd-teal" />
          Cargando recomendaciones
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold leading-snug md:text-3xl">
          <span className="sr-only">Calculando el mejor plan…</span>
          <WaveLoadingText text="Calculando el mejor plan" />
          <span className="dayplan-ellipsis ml-0.5 inline-block w-[1.25em] text-left" aria-hidden>
            …
          </span>
        </h2>
        <p
          key={step}
          className="dayplan-step-fade mt-2 text-sm text-white/90 md:text-base"
        >
          {LOADING_STEPS[step]}
        </p>
        <div className="mt-4 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-white/20">
          <div className="dayplan-progress-bar h-full w-2/5 rounded-full bg-gradient-to-r from-transparent via-rd-teal to-white" />
        </div>
        <div className="mt-3 flex items-center gap-2" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="dayplan-bounce-dot h-2 w-2 rounded-full bg-white"
              style={{ animationDelay: `${i * 0.16}s` }}
            />
          ))}
          <span className="ml-1 text-xs text-white/70">trabajando…</span>
        </div>
      </div>
      <div className="flex min-w-[10rem] items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/25">
        <span className="relative flex h-11 w-11 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-rd-teal/35" />
          <Loader2 className="relative h-6 w-6 animate-spin text-white" />
        </span>
        <div>
          <p className="text-xs uppercase tracking-wide text-white/70">Estado</p>
          <p className="font-display text-lg font-bold">Cargando</p>
        </div>
      </div>
    </div>
  )
}

function RecommendationCard({ rec }: { rec: DayRecommendation }) {
  const navigate = useNavigate()
  const Icon = rec.kind === 'beach' ? Waves : Trees

  function openPlace() {
    navigate(rec.href)
  }

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`Ver detalle de ${rec.name}`}
      onClick={openPlace}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openPlace()
        }
      }}
      className="panel rec-card group flex flex-col gap-4 p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
                rec.kind === 'beach'
                  ? 'bg-cyan-50 text-cyan-800 ring-1 ring-cyan-200'
                  : 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200',
              )}
            >
              <Icon className="h-3 w-3" />
              {rec.kind === 'beach' ? 'Playa' : 'Parque'}
            </span>
            <span className="text-xs text-rd-slate">{rec.province}</span>
          </div>
          <h3 className="mt-2 font-display text-xl font-bold leading-snug text-rd-ink transition group-hover:text-rd-ocean">
            {rec.name}
          </h3>
          <p className="mt-1 text-sm font-medium text-rd-ocean">{rec.verdict}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-3xl font-bold text-rd-deep">{Math.round(rec.score)}</p>
          <p className="text-[11px] uppercase tracking-wide text-rd-slate">score</p>
        </div>
      </div>

      {rec.detail ? <p className="text-sm text-rd-slate">{rec.detail}</p> : null}

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rd-slate">Por qué ir</p>
        <ul className="mt-2 space-y-1.5">
          {rec.whyGo.map((w) => (
            <li key={w} className="flex gap-2 text-sm text-rd-ink">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rd-amber" />
              <span>{w}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-rd-mist/70 px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-rd-ocean">Cuándo</p>
          <p className="mt-1 text-sm text-rd-ink">{rec.bestWindow}</p>
        </div>
        <div className="rounded-xl bg-white/80 px-3 py-2.5 ring-1 ring-rd-deep/10">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-rd-slate">Clima del día</p>
          <p className="mt-1 text-sm text-rd-ink">
            {rec.weather.weatherLabel} · {formatNumber(rec.weather.tempMin)}–
            {formatNumber(rec.weather.tempMax)}°C · {formatNumber(rec.weather.precipMm)} mm
          </p>
        </div>
      </div>

      {rec.avoid ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50/90 px-3 py-2 text-sm text-amber-950">
          <span className="font-semibold">Evita: </span>
          {rec.avoid}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Link
          to={rec.href}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 rounded-full bg-rd-deep px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-rd-ocean"
        >
          Ver ficha
        </Link>
        <a
          href={googleMapsPlaceUrl(rec.lat, rec.lon, rec.mapsLabel)}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 rounded-full border border-rd-deep/15 bg-white px-3.5 py-2 text-xs font-semibold text-rd-deep hover:border-rd-teal"
        >
          <MapPin className="h-3.5 w-3.5" />
          Mapa
        </a>
        <a
          href={googleMapsDirectionsUrl(rec.lat, rec.lon, rec.mapsLabel)}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 rounded-full border border-rd-deep/15 bg-white px-3.5 py-2 text-xs font-semibold text-rd-deep hover:border-rd-teal"
        >
          <Navigation className="h-3.5 w-3.5" />
          Cómo llegar
        </a>
      </div>
      <p className="text-xs font-medium text-rd-ocean/80">Clic en la tarjeta para abrir el detalle →</p>
    </article>
  )
}

export function DayPlanPage() {
  const [filters, setFilters] = useState<DayPlanFilters>(defaultDayPlanFilters)
  const [query, setQuery] = useState('')
  const [activeIntent, setActiveIntent] = useState('all')

  const deps = useMemo(
    () => [
      filters.dayOffset,
      filters.kinds === 'all' ? 'all' : filters.kinds.join(','),
      filters.preferFree,
      filters.preferFamily,
      filters.preferCovered,
      filters.provinceHint,
    ],
    [filters],
  )

  const { data, error, loading, reload } = useAsyncData(() => loadDayPlan(filters), deps)

  function applyDay(offset: number) {
    setFilters((f) => ({ ...f, dayOffset: offset }))
  }

  function applyIntent(id: string) {
    const chip = INTENT_CHIPS.find((c) => c.id === id)
    if (!chip) return
    setActiveIntent(id)
    setFilters((f) => chip.apply(f))
  }

  function runQuery(text: string) {
    const next = parseDayPlanQuery(text, filters)
    setQuery(text)
    setFilters(next)
    if (/playa|mar|costa|sargazo/.test(text.toLowerCase())) setActiveIntent('beaches')
    else if (/parque|jard|mirador|zool|acuario/.test(text.toLowerCase())) setActiveIntent('parks')
    else if (/gratis/.test(text.toLowerCase())) setActiveIntent('free')
    else if (/familia|ni[nñ]/.test(text.toLowerCase())) setActiveIntent('family')
    else if (/lluvia|techado|acuario|cueva/.test(text.toLowerCase())) setActiveIntent('rain')
    else setActiveIntent('all')
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Qué hacer hoy?"
        description="Recomendaciones orientativas según el clima de hoy, mañana o los próximos días: parques y playas de RD con el porqué, cuándo ir y qué evitar."
        sources={[
          { name: 'Open-Meteo' },
          { name: 'Parques (catálogo)' },
          { name: 'Heurística RDIntelligence' },
        ]}
      />

      <Disclaimer>
        Estas sugerencias son solo orientativas y se basan en datos abiertos. Lo recomendable es
        priorizar siempre la información oficial del gobierno (COE, MITUR, Medio Ambiente y
        autoridades locales) sobre alertas, cierres, horarios y condiciones del lugar antes de
        salir.{' '}
        <InfoTip text={TIPS.dayPlan} />
      </Disclaimer>

      <section className="panel overflow-hidden p-0">
        <div className="bg-[linear-gradient(135deg,#0b3d4a_0%,#137a8a_55%,#1aa6a0_100%)] px-5 py-6 text-white md:px-7">
          {loading ? (
            <DayPlanLoadingHero />
          ) : (
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl">
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                  <Compass className="h-3.5 w-3.5" />
                  Recomendación del día
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold leading-snug md:text-3xl">
                  {data?.headline ?? 'Planifica tu salida'}
                </h2>
                <p className="mt-2 text-sm text-white/85 md:text-base">{data?.summary ?? ''}</p>
              </div>
              {data ? (
                <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/20">
                  <WeatherIcon code={data.hubWeather.weatherCode} size="md" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-white/70">Capital (ref.)</p>
                    <p className="font-display text-xl font-bold">
                      {formatNumber(data.hubWeather.tempMin)}–{formatNumber(data.hubWeather.tempMax)}°C
                    </p>
                    <p className="text-sm text-white/85">
                      {data.hubWeather.weatherLabel} · {formatNumber(data.hubWeather.precipMm)} mm
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="space-y-5 p-5 md:p-7">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-rd-slate">
              <CalendarDays className="h-3.5 w-3.5" />
              Día
            </p>
            <div className="flex flex-wrap gap-2">
              {DAY_CHIPS.map((d) => (
                <button
                  key={d.offset}
                  type="button"
                  onClick={() => applyDay(d.offset)}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-semibold transition',
                    filters.dayOffset === d.offset
                      ? 'bg-rd-deep text-white'
                      : 'border border-rd-deep/10 bg-white text-rd-deep hover:border-rd-teal',
                  )}
                >
                  {d.short}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-rd-slate">Tipo de plan</p>
            <div className="flex flex-wrap gap-2">
              {INTENT_CHIPS.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => applyIntent(chip.id)}
                  className={cn(
                    'rounded-full px-3.5 py-1.5 text-sm font-medium transition',
                    activeIntent === chip.id
                      ? 'bg-rd-teal/20 text-rd-deep ring-1 ring-rd-teal/50'
                      : 'border border-rd-deep/10 bg-white text-rd-slate hover:text-rd-deep',
                  )}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault()
              runQuery(query)
            }}
          >
            <label className="sr-only" htmlFor="dayplan-query">
              Pedir recomendación
            </label>
            <input
              id="dayplan-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Ej: "playas mañana" o "parques gratis en Santo Domingo"'
              className="min-w-0 flex-1 rounded-2xl border border-rd-deep/15 bg-white px-4 py-3 text-sm text-rd-ink outline-none ring-rd-teal/40 placeholder:text-rd-slate/70 focus:ring-2"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rd-coral px-5 py-3 text-sm font-semibold text-white transition hover:bg-rd-coral/90"
            >
              <Sparkles className="h-4 w-4" />
              Recomendar
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {PROMPT_EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => runQuery(ex)}
                className="rounded-full bg-rd-mist px-3 py-1 text-xs font-medium text-rd-deep transition hover:bg-rd-teal/20"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </section>

      {loading ? <LoadingState label="Armando recomendaciones con clima vivo…" /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}

      {data && !loading ? (
        <>
          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-bold text-rd-ink">Mejores opciones</h2>
                <p className="text-sm text-rd-slate">{data.dayLabel} · ranking por clima y tipo de lugar</p>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {data.recommendations.map((rec) => (
                <RecommendationCard key={rec.id} rec={rec} />
              ))}
            </div>
            {!data.recommendations.length ? (
              <div className="panel flex items-center gap-3 p-6 text-rd-slate">
                <Umbrella className="h-5 w-5 text-rd-ocean" />
                No hubo coincidencias. Prueba “Todo” o cambia el día.
              </div>
            ) : null}
            <p className="mt-4 text-sm text-rd-slate">
              Recuerda: lo recomendable es validar alertas, cierres y operación con la información
              oficial del gobierno (COE, MITUR, Medio Ambiente u operador del lugar) antes de ir.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-rd-ink">Próximos días (rápido)</h2>
            <p className="text-sm text-rd-slate">
              Vista de la mejor sugerencia por día con tus filtros actuales. Toca un día para ver el detalle.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {data.weekOutlook.map((d) => (
                <button
                  key={d.dayOffset}
                  type="button"
                  onClick={() => applyDay(d.dayOffset)}
                  className={cn(
                    'panel p-4 text-left transition hover:-translate-y-0.5',
                    filters.dayOffset === d.dayOffset && 'ring-2 ring-rd-teal',
                  )}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-rd-ocean">{d.label}</p>
                  <p className="mt-2 line-clamp-2 font-display text-base font-bold leading-snug text-rd-ink">
                    {d.topName}
                  </p>
                  <p className="mt-2 text-sm text-rd-slate">Score {Math.round(d.score)}</p>
                </button>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  )
}
