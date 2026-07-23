import { Link } from 'react-router-dom'
import { ArrowRight, Satellite } from 'lucide-react'
import { MODULES } from '@/data/modules'
import { useAsyncData } from '@/shared/hooks/useAsyncData'
import {
  currentHourIndex,
  fetchForecast,
  maxNextHours,
  sumNextHours,
} from '@/shared/api/openMeteo'
import { MetricCard } from '@/shared/components/MetricCard'
import { LoadingState, ErrorState } from '@/shared/components/States'
import { WeatherIcon, weatherVisual } from '@/shared/components/WeatherIcon'
import { clamp, floodRiskFromPrecip, formatNumber } from '@/shared/lib/utils'
import { TIPS } from '@/data/tips'
import { ABBATECH } from '@/data/abbatech'

export function HomePage() {
  const { data, error, loading, reload } = useAsyncData(
    () => fetchForecast(18.4861, -69.9312),
    [],
  )

  const idx = data ? currentHourIndex(data.hourly.time) : 0
  const rain5 = data ? sumNextHours(data.hourly.precipitation, 5, idx) : 0
  const rainMax = data ? maxNextHours(data.hourly.precipitation, 5, idx) : 0
  const flood = floodRiskFromPrecip(rain5, rainMax)
  const nationalRisk = data
    ? clamp(
        flood * 0.45 +
          (data.current?.relative_humidity_2m ?? 60) * 0.15 +
          (data.current?.wind_speed_10m ?? 10) * 0.8,
      )
    : 0

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-rd-deep/10 bg-[linear-gradient(135deg,#0b3d4a_0%,#137a8a_48%,#1aa6a0_100%)] px-6 py-10 text-white shadow-[0_20px_60px_rgb(11_61_74_/_0.25)] md:px-10 md:py-14">
        <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-rd-teal/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-rd-coral/20 blur-3xl" />
        <div className="relative max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white/90">
            <Satellite className="h-3.5 w-3.5" />
            República Dominicana
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-snug tracking-normal md:text-6xl">
            RDIntelligence
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/85 md:text-lg">
            Información clara para ciudadanos: clima, playas, riesgos, sismos, huracanes y más, con
            datos abiertos de República Dominicana.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/riesgos"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-rd-deep transition hover:bg-rd-mist"
            >
              Ver riesgos en mi provincia
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/sismos"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Ver sismos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-6 max-w-2xl text-sm text-white/75">
            Demo gratuita desarrollada por{' '}
            <a
              href={ABBATECH.url}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-white underline underline-offset-2 hover:text-rd-mist"
            >
              {ABBATECH.name}
            </a>
            . No sustituye alertas oficiales del gobierno.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? <LoadingState /> : null}
        {error ? <ErrorState message={error} onRetry={reload} /> : null}
        {data && !loading ? (
          <>
            <div className="panel flex items-center gap-3 p-4 sm:col-span-2 xl:col-span-1">
              <WeatherIcon code={data.current?.weather_code ?? 0} size="md" />
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-rd-slate">
                  Santo Domingo ahora
                </p>
                <p className="font-display text-3xl font-bold leading-snug tracking-normal text-rd-ink">
                  {formatNumber(data.current?.temperature_2m ?? 0)}°C
                </p>
                <p className="text-sm text-rd-slate">
                  {weatherVisual(data.current?.weather_code ?? 0).label}
                </p>
              </div>
            </div>
            <MetricCard
              label="Lluvia próximas 5h"
              value={`${formatNumber(rain5)} mm`}
              hint={`Pico horario ${formatNumber(rainMax)} mm`}
              tip={`${TIPS.rain5h} ${TIPS.rainPeak}`}
            />
            <MetricCard
              label="Riesgo inundación SD"
              value={Math.round(flood)}
              hint="Heurística basada en precipitación"
              tip={TIPS.floodRisk}
              accent="text-rd-ocean"
            />
            <MetricCard
              label="Índice nacional (demo)"
              value={Math.round(nationalRisk)}
              hint="Compuesto clima + lluvia + viento"
              tip={TIPS.nationalIndex}
              accent="text-rd-coral"
            />
          </>
        ) : null}
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold leading-snug text-rd-ink">Módulos</h2>
            <p className="text-sm text-rd-slate">Cada sección consume fuentes abiertas o heurísticas documentadas.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {MODULES.map((m) => {
            const Icon = m.icon
            return (
              <Link
                key={m.id}
                to={m.path}
                className="group panel relative overflow-hidden p-5 transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgb(11_61_74_/_0.12)]"
              >
                <div
                  className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${m.accent} text-white shadow-sm`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-bold leading-snug text-rd-ink group-hover:text-rd-ocean">
                  {m.title}
                </h3>
                <p className="mt-1 text-sm text-rd-slate">{m.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-rd-ocean">
                  Abrir
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
