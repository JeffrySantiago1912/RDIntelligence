# RDIntelligence — Fuentes de datos

Documentación sencilla de **de dónde sale cada información** en la fase actual (frontend React + Vite, sin backend propio).

## Arquitectura

```
src/
  app/            # Shell, router
  features/       # Un módulo = una sección
  shared/
    api/          # Clientes HTTP a APIs públicas
    components/   # UI reutilizable
    hooks/
    lib/          # Heurísticas y utilidades
  data/           # Catálogos (provincias, playas, módulos)
```

- UI: React 19 + Vite + Tailwind CSS v4 + Leaflet + Recharts
- Sin backend: el navegador llama APIs gratuitas con CORS (o usa heurísticas documentadas)
- Huracanes: NASA EONET (CORS `*`), no el JSON directo de NHC

## Fuentes en vivo

| Fuente | URL | Módulos | Auth |
|---|---|---|---|
| Open-Meteo Forecast | https://api.open-meteo.com/v1/forecast | Clima, Inundaciones, Apagones, Incendios, Dengue, Agrícola, Agua, Riesgos, Turismo, Sargazo | No |
| Open-Meteo Marine | https://marine-api.open-meteo.com/v1/marine | Playas, Pesca, Turismo | No (`models=ncep_gfswave016`) |
| Open-Meteo Air Quality | https://air-quality-api.open-meteo.com/v1/air-quality | Respiratorio, Riesgos | No |
| USGS Earthquakes | https://earthquake.usgs.gov/fdsnws/event/1/ | Sismos | No |
| NASA EONET | https://eonet.gsfc.nasa.gov/api/v3/events | Huracanes | No (CORS `*`) |
| World Bank Open Data | https://api.worldbank.org/v2/ | Economía | No |
| OpenStreetMap tiles | https://tile.openstreetmap.org/ | Mapas | No |

## Heurísticas (sin API oficial gratuita)

| Módulo | Qué calcula | Por qué |
|---|---|---|
| Sargazo | Índice estacional + viento onshore | No hay feed abierto estable de cobertura de sargazo para RD |
| Apagones | Lluvia + viento + códigos de tormenta | EDESur/EDEEste/EDENorte no publican API abierta de interrupciones |
| Inundaciones | Precipitación 5h + sesgo por sector | Falta DEM/INDRHI/reportes ciudadanos en esta fase |
| Dengue | Temp + humedad + lluvia | Proxy ambiental; no es boletín MSP |
| Turismo | Clima + UV + oleaje + sargazo | Score de producto; no incluye vuelos/hoteles aún |
| Tráfico | Patrones horarios tipificados | Google/Waze no son free-tier para este uso sin backend/clave |

## Fuentes dominicanas / institucionales (roadmap)

Estas son las fuentes que mencionaste; **aún no hay integración directa** porque no ofrecen API REST pública con CORS usable desde el browser:

- ONAMET — clima/alertas
- COE — emergencias
- INDRHI — ríos/embalses
- ONE — estadísticas
- Banco Central — series diarias / FX
- Ministerio de Turismo
- IDE-RD — capas geo
- Centro Nacional de Sismología (complemento a USGS)
- NASA FIRMS — requiere MAP_KEY gratuita

## Cómo correr

```bash
npm install
npm run dev
```

Abrir la app y navegar cada módulo desde el menú lateral. La página **Fuentes de datos** resume esto mismo en la UI.

## Próximo paso natural (backend)

Cuando quieras backend:

1. BFF NestJS/FastAPI para NHC, FIRMS, Banco Central y scrapers institucionales
2. PostgreSQL + PostGIS
3. Cache Redis de Open-Meteo
4. Modelos ML reales (inundaciones / dengue) entrenados con histórico
