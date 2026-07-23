import { SectionHeader } from '@/shared/components/SectionHeader'
import { MetricCard } from '@/shared/components/MetricCard'
import { Disclaimer } from '@/shared/components/States'
import { MapView } from '@/shared/components/MapView'

const CORRIDORS = [
  {
    id: '27feb',
    name: 'Av. 27 de Febrero',
    lat: 18.47,
    lon: -69.94,
    now: 72,
    in45: 81,
    note: 'Hora pico laboral tipificada',
  },
  {
    id: 'kennedy',
    name: 'Av. John F. Kennedy',
    lat: 18.485,
    lon: -69.95,
    now: 65,
    in45: 74,
    note: 'Congestión recurrente este-oeste',
  },
  {
    id: 'duarte',
    name: 'Autopista Duarte (entrada SD)',
    lat: 18.52,
    lon: -70.02,
    now: 58,
    in45: 70,
    note: 'Flujo suburbano matutino/vespertino',
  },
  {
    id: 'santiago',
    name: 'Av. Estrella Sadhalá (Santiago)',
    lat: 19.46,
    lon: -70.69,
    now: 48,
    in45: 55,
    note: 'Patrón urbano intermedio',
  },
]

export function TrafficPage() {
  const hour = new Date().getHours()
  const peakBoost = hour >= 7 && hour <= 9 || hour >= 17 && hour <= 20 ? 12 : 0

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Tráfico inteligente RD"
        description="Vista demo de corredores clave con proyección a 45 minutos. Lista para conectar Google Maps / TomTom / Waze."
        sources={[{ name: 'Patrones tipificados (demo)' }, { name: 'OpenStreetMap' }]}
      />
      <Disclaimer>
        Google Maps Directions / Waze no son APIs gratuitas sin restricciones para este uso. Mientras
        no haya backend ni clave, se muestran patrones horarios realistas de corredores capitalinos.
      </Disclaimer>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Hora local"
          value={`${hour}:00`}
          hint="America/Santo_Domingo"
          tip="Hora actual en República Dominicana. El tráfico cambia mucho entre madrugada, mediodía y horas pico."
        />
        <MetricCard
          label="Factor pico"
          value={peakBoost > 0 ? '+12' : '0'}
          hint="Ajuste horario"
          tip="Si estás en hora pico (mañana o tarde laboral), sumamos +12 al índice de congestión tipificado."
        />
        <MetricCard
          label="Corredores"
          value={CORRIDORS.length}
          hint="Demo Santo Domingo / Santiago"
          tip="Avenidas o vías principales usadas en esta demo. El número de congestión es estimado, no GPS en vivo."
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MapView
          className="h-[400px]"
          markers={CORRIDORS.map((c) => ({
            id: c.id,
            position: [c.lat, c.lon],
            label: c.name,
            detail: `Ahora ${c.now + peakBoost} → +45m ${c.in45 + peakBoost}`,
            color: '#f07167',
          }))}
        />
        <ul className="panel divide-y divide-rd-deep/5">
          {CORRIDORS.map((c) => (
            <li key={c.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-rd-slate">{c.note}</p>
                </div>
                <div className="text-right text-sm">
                  <p>
                    Ahora <strong>{c.now + peakBoost}</strong>
                  </p>
                  <p className="text-rd-ocean">
                    +45 min <strong>{c.in45 + peakBoost}</strong>
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
