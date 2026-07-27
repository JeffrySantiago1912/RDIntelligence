import { useEffect, type ReactNode } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { LatLngExpression } from 'leaflet'

export type MapMarker = {
  id: string
  position: LatLngExpression
  label: string
  detail?: string
  color?: string
  radius?: number
}

type MapViewProps = {
  center?: LatLngExpression
  zoom?: number
  markers?: MapMarker[]
  className?: string
  children?: ReactNode
  onMarkerClick?: (id: string) => void
  selectedId?: string | null
}

function FitBounds({ markers }: { markers: MapMarker[] }) {
  const map = useMap()
  useEffect(() => {
    if (markers.length === 0) return
    if (markers.length === 1) {
      map.setView(markers[0].position, 11)
      return
    }
    const bounds = L.latLngBounds(markers.map((m) => L.latLng(m.position as [number, number])))
    map.fitBounds(bounds, { padding: [28, 28] })
  }, [map, markers])
  return null
}

export function MapView({
  center = [18.7357, -70.1627],
  zoom = 8,
  markers = [],
  className = 'h-80',
  children,
  onMarkerClick,
  selectedId,
}: MapViewProps) {
  return (
    <div className={`overflow-hidden rounded-xl border border-rd-deep/10 ${className}`}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds markers={markers} />
        {children}
        {markers.map((m) => {
          const selected = selectedId === m.id
          return (
            <CircleMarker
              key={m.id}
              center={m.position}
              radius={selected ? (m.radius ?? 10) + 4 : (m.radius ?? 10)}
              pathOptions={{
                color: selected ? '#0b3d4a' : (m.color ?? '#0b3d4a'),
                fillColor: m.color ?? '#2ec4b6',
                fillOpacity: selected ? 0.95 : 0.75,
                weight: selected ? 3 : 2,
              }}
              eventHandlers={
                onMarkerClick
                  ? {
                      click: () => onMarkerClick(m.id),
                    }
                  : undefined
              }
            >
              <Popup>
                <strong>{m.label}</strong>
                {m.detail ? <div>{m.detail}</div> : null}
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}
