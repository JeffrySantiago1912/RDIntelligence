import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/app/AppShell'
import { HomePage } from '@/features/home/HomePage'
import { RisksPage } from '@/features/risks/RisksPage'
import { ClimatePage } from '@/features/climate/ClimatePage'
import { FloodsPage } from '@/features/floods/FloodsPage'
import { BeachesPage } from '@/features/beaches/BeachesPage'
import { SargassumPage } from '@/features/sargassum/SargassumPage'
import { OutagesPage } from '@/features/outages/OutagesPage'
import { TrafficPage } from '@/features/traffic/TrafficPage'
import { FiresPage } from '@/features/fires/FiresPage'
import { HurricanesPage } from '@/features/hurricanes/HurricanesPage'
import { EarthquakesPage } from '@/features/earthquakes/EarthquakesPage'
import { DenguePage } from '@/features/dengue/DenguePage'
import { AgriculturePage } from '@/features/agriculture/AgriculturePage'
import { FishingPage } from '@/features/fishing/FishingPage'
import { TourismPage } from '@/features/tourism/TourismPage'
import { EconomyPage } from '@/features/economy/EconomyPage'
import { WaterPage } from '@/features/water/WaterPage'
import { RespiratoryPage } from '@/features/respiratory/RespiratoryPage'
import { SourcesPage } from '@/features/sources/SourcesPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="riesgos" element={<RisksPage />} />
          <Route path="clima" element={<ClimatePage />} />
          <Route path="inundaciones" element={<FloodsPage />} />
          <Route path="playas" element={<BeachesPage />} />
          <Route path="sargazo" element={<SargassumPage />} />
          <Route path="apagones" element={<OutagesPage />} />
          <Route path="trafico" element={<TrafficPage />} />
          <Route path="incendios" element={<FiresPage />} />
          <Route path="huracanes" element={<HurricanesPage />} />
          <Route path="sismos" element={<EarthquakesPage />} />
          <Route path="dengue" element={<DenguePage />} />
          <Route path="agricola" element={<AgriculturePage />} />
          <Route path="pesca" element={<FishingPage />} />
          <Route path="turismo" element={<TourismPage />} />
          <Route path="economia" element={<EconomyPage />} />
          <Route path="agua" element={<WaterPage />} />
          <Route path="respiratorio" element={<RespiratoryPage />} />
          <Route path="fuentes" element={<SourcesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
