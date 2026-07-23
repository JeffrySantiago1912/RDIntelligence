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

type Props = {
  center?: LatLngExpression
  zoom?: number
  markers?: MapMarker[]
  className?: string
  children?: ReactNode
}

export function MapView({
  center = [18.7357, -70.1627],
  zoom = 8,
  markers = [],
  className = 'h-80',
  children,
}: Props) {
  return (
    <div className={`overflow-hidden rounded-xl border border-rd-deep/10 ${className}`}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds markers={markers} />
        {children}
        {markers.map((m) => (
          <CircleMarker
            key={m.id}
            center={m.position}
            radius={m.radius ?? 10}
            pathOptions={{
              color: m.color ?? '#0b3d4a',
              fillColor: m.color ?? '#2ec4b6',
              fillOpacity: 0.75,
              weight: 2,
            }}
          >
            <Popup>
              <strong>{m.label}</strong>
              {m.detail ? <div>{m.detail}</div> : null}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
