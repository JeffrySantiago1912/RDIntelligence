import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BEACHES } from '@/data/locations'
import { useAsyncData } from '@/shared/hooks/useAsyncData'
import {
  currentHourIndex,
  fetchForecast,
  fetchMarine,
} from '@/shared/api/openMeteo'
import { SectionHeader } from '@/shared/components/SectionHeader'
import { MetricCard } from '@/shared/components/MetricCard'
import { LoadingState, ErrorState, Disclaimer } from '@/shared/components/States'
import { MapView } from '@/shared/components/MapView'
import { beachFlag, formatNumber, sargassumIndex } from '@/shared/lib/utils'
import { TIPS } from '@/data/tips'

async function loadBeach(lat: number, lon: number) {
  const [forecast, marine] = await Promise.all([fetchForecast(lat, lon), fetchMarine(lat, lon)])
  const idx = currentHourIndex(forecast.hourly.time)
  const mIdx = currentHourIndex(marine.hourly.time)
  const wave = marine.hourly.wave_height[mIdx] ?? 0
  const wind = forecast.current?.wind_speed_10m ?? forecast.hourly.wind_speed_10m[idx]
  const windDir = forecast.current?.wind_direction_10m ?? forecast.hourly.wind_direction_10m[idx]
  const uv = forecast.hourly.uv_index?.[idx] ?? forecast.daily?.uv_index_max?.[0] ?? 0
  const rain = forecast.hourly.precipitation[idx] ?? 0
  const sargazo = sargassumIndex(new Date().getMonth() + 1, windDir, wind)
  const flag = beachFlag(wave, wind, uv)
  return { wave, wind, uv, rain, sargazo, flag, period: marine.hourly.wave_period?.[mIdx] ?? null }
}

export function BeachesPage() {
  const [searchParams] = useSearchParams()
  const [beachId, setBeachId] = useState(BEACHES[0].id)
  const beach = BEACHES.find((b) => b.id === beachId) ?? BEACHES[0]
  const { data, error, loading, reload } = useAsyncData(
    () => loadBeach(beach.lat, beach.lon),
    [beach.lat, beach.lon],
  )

  useEffect(() => {
    const lugar = searchParams.get('lugar') ?? searchParams.get('id')
    if (!lugar) return
    if (!BEACHES.some((b) => b.id === lugar)) return
    setBeachId(lugar)
    const t = window.setTimeout(() => {
      document.getElementById('beach-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
    return () => window.clearTimeout(t)
  }, [searchParams])

  const sargazoLabel =
    data && data.sargazo >= 65 ? 'Alto' : data && data.sargazo >= 35 ? 'Moderado' : 'Bajo'
  const oleajeLabel =
    data && data.wave >= 2 ? 'Fuerte' : data && data.wave >= 1.2 ? 'Moderado' : 'Suave'

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Estado de las playas"
        description="Oleaje, sol, viento y bandera recomendada para saber si conviene bañarse."
        sources={[
          { name: 'Open-Meteo Marine', href: 'https://open-meteo.com/en/docs/marine-weather-api' },
          { name: 'Open-Meteo Forecast', href: 'https://open-meteo.com/en/docs' },
        ]}
      />

      <Disclaimer>
        Aún no hay datos abiertos oficiales de bacterias o medusas para todas las playas. Aquí verás
        condiciones del mar y del clima en vivo.
      </Disclaimer>

      <select
        value={beachId}
        onChange={(e) => setBeachId(e.target.value)}
        className="rounded-xl border border-rd-deep/15 bg-white px-3 py-2 text-sm"
      >
        {BEACHES.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name} · {b.province}
          </option>
        ))}
      </select>

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}

      {data ? (
        <div id="beach-detail" className="scroll-mt-24 space-y-6">
          <div className="panel flex flex-wrap items-center gap-4 p-5">
            <div className={`h-4 w-4 rounded-full ${data.flag.tone}`} />
            <div>
              <p className="text-xs uppercase tracking-wider text-rd-slate">Bandera · {beach.name}</p>
              <p className="font-display text-2xl font-bold leading-snug">
                {data.flag.flag} · {data.flag.estado}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Estado" value={data.flag.estado} tip={TIPS.beachFlag} />
            <MetricCard
              label="Oleaje"
              value={oleajeLabel}
              hint={`${formatNumber(data.wave)} m`}
              tip={TIPS.wave}
            />
            <MetricCard label="UV" value={formatNumber(data.uv, 0)} tip={TIPS.uv} />
            <MetricCard
              label="Sargazo (est.)"
              value={sargazoLabel}
              hint={`${Math.round(data.sargazo)}/100`}
              tip={TIPS.sargassum}
            />
            <MetricCard
              label="Viento"
              value={`${formatNumber(data.wind)} km/h`}
              tip={TIPS.wind}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <MapView
              className="h-[380px] sm:h-[420px]"
              center={[beach.lat, beach.lon]}
              zoom={11}
              markers={[
                {
                  id: beach.id,
                  position: [beach.lat, beach.lon],
                  label: beach.name,
                  detail: data.flag.estado,
                  color: '#137a8a',
                },
              ]}
            />
            <div className="panel p-5">
              <h2 className="font-display text-lg font-bold leading-snug">Resumen para bañistas</h2>
              <ul className="mt-4 space-y-3 text-sm text-rd-slate">
                <li>
                  <span className="font-medium text-rd-ink">Bandera {data.flag.flag}:</span>{' '}
                  {data.flag.estado === 'Excelente'
                    ? 'Buen momento para disfrutar la playa con precauciones normales.'
                    : data.flag.estado === 'Precaución'
                      ? 'Entra con cuidado; revisa oleaje y viento antes de nadar lejos.'
                      : 'Mejor no bañarse o mantenerte muy cerca de la orilla.'}
                </li>
                <li>
                  <span className="font-medium text-rd-ink">Oleaje {oleajeLabel}:</span>{' '}
                  {formatNumber(data.wave)} metros de altura aproximada.
                </li>
                <li>
                  <span className="font-medium text-rd-ink">Sol (UV {formatNumber(data.uv, 0)}):</span>{' '}
                  {data.uv >= 8
                    ? 'Usa protector solar, gorra y busca sombra al mediodía.'
                    : 'Protección solar recomendada si estarás varias horas afuera.'}
                </li>
                <li>
                  <span className="font-medium text-rd-ink">Sargazo {sargazoLabel}:</span> estimación
                  por temporada y viento, no un sensor oficial.
                </li>
                <li>
                  <span className="font-medium text-rd-ink">Viento:</span>{' '}
                  {formatNumber(data.wind)} km/h · lluvia ahora {formatNumber(data.rain)} mm.
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
