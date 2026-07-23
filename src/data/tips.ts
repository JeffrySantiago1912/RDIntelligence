/** Textos cortos en español para tooltips (público general). */
export const TIPS = {
  tempNow:
    'Temperatura del aire en este momento, en grados Celsius (°C). Ejemplo: 30 °C se siente caluroso en RD.',
  weatherCondition:
    'Condición del cielo según el modelo meteorológico: despejado, nublado, llovizna, lluvia o tormenta.',
  rain5h:
    'Suma de lluvia esperada en las próximas 5 horas, en milímetros (mm). 1 mm ≈ 1 litro de agua por metro cuadrado.',
  rainPeak:
    'La hora con más lluvia intensa dentro de ese periodo. Útil para saber cuándo puede anegarse la calle.',
  floodRisk:
    'Estimación 0–100 de qué tan probable es que se inunden calles bajas según la lluvia prevista. No es alerta oficial del COE.',
  nationalIndex:
    'Número de demostración que combina clima, lluvia y viento. Sirve para ver un “pulso” rápido del día, no un índice oficial.',
  humidity:
    'Cantidad de vapor de agua en el aire (0–100%). Alta humedad hace que el calor se sienta más sofocante.',
  wind:
    'Velocidad del viento cerca del suelo, en kilómetros por hora (km/h). Más alto = ráfagas más fuertes.',
  rainNow: 'Lluvia medida o estimada en este momento, en milímetros (mm).',
  uv: 'Índice de rayos ultravioletas del sol. 0–2 bajo, 3–5 moderado, 6–7 alto, 8–10 muy alto, 11+ extremo (usa protector).',
  uv100: 'Rayos UV convertidos a una escala 0–100 para comparar con otros riesgos. Más alto = más daño solar.',
  beachFlag:
    'Recomendación tipo bandera de playa: Verde = condiciones favorables, Amarilla = precaución, Roja = peligroso para bañarse.',
  wave:
    'Altura del oleaje en metros. Suave < 1.2 m, Moderado 1.2–2 m, Fuerte > 2 m. Oleaje alto dificulta el baño.',
  sargassum:
    'Estimación de presión de sargazo (alga marrón en la costa). No es un sensor oficial; usa temporada y viento.',
  outageRisk:
    'Probabilidad relativa de fallas eléctricas por clima severo (lluvia, viento, tormentas). No reporta apagones reales de las EDE.',
  fireRisk:
    'Qué tan favorables están el calor, la sequedad y el viento para incendios forestales. No muestra focos satelitales aún.',
  dengueRisk:
    'Condiciones de clima que favorecen al mosquito del dengue (calor + humedad + lluvia). No es un boletín de Salud Pública.',
  soilMoisture:
    'Agua en la capa superficial del suelo. Bajo = seco para cultivos; alto = suelo más húmedo.',
  drought:
    'Estimación de estrés por falta de lluvia y suelo seco. Más alto = más riesgo de sequía.',
  waterStress:
    'Proxy de tensión en el suministro de agua basado en clima. No muestra cortes reales de INAPA/CAASD.',
  dust: 'Cantidad de polvo en el aire (µg/m³). Puede subir con polvo del Sahara y molestar la respiración.',
  pm10: 'Partículas finas de hasta 10 micras. Más alto = aire más contaminado para pulmones.',
  pm25: 'Partículas aún más finas (2.5 micras). Entran más profundo en el sistema respiratorio.',
  aqi: 'Índice europeo de calidad del aire. Valores bajos = mejor aire; altos = evite ejercicio intenso al aire libre.',
  respiratoryAlert:
    'Nivel combinado de polvo y partículas. Alto sugiere cuidar a niños, adultos mayores y personas asmáticas.',
  fishingSafety:
    'Qué tan seguro está el mar para salir a faenar según oleaje y viento. Bajo = mejor quedarse en puerto.',
  fishingScore: 'Puntuación orientativa para condiciones de pesca (oleaje, periodo de ola y viento).',
  tourismScore:
    'Puntaje 0–100 de atractivo del destino hoy (clima, UV, oleaje y sargazo estimado). 80+ suele ser excelente.',
  earthquakeMag:
    'Magnitud del sismo (escala Richter/Momento). 2–3 apenas se siente; 5+ puede causar daños locales.',
  stormIntensity:
    'Vientos máximos sostenidos del ciclón en nudos (kt). ≈ 1 kt = 1.85 km/h. Más alto = más peligroso.',
  stormDistance: 'Distancia aproximada en línea recta desde Santo Domingo hasta el centro de la tormenta.',
  inflation: 'Subida general de precios en un año. Si es 4%, la canasta típica encareció cerca de ese porcentaje.',
  gdpGrowth: 'Qué tanto creció (o cayó) la economía del país en el año, en porcentaje.',
  unemployment: 'Porcentaje de personas en la fuerza laboral que buscan trabajo y no lo tienen.',
  gdpCapita: 'Producción económica promedio por persona (USD). Sirve para comparar nivel de ingreso relativo.',
  trafficNow: 'Nivel estimado de congestión ahora (0–100) en corredores típicos. Es demo, no GPS en vivo.',
  traffic45: 'Proyección de congestión dentro de 45 minutos según hora pico tipificada.',
  rain7d: 'Lluvia acumulada esperada / reciente en ~7 días. Poca lluvia eleva el estrés hídrico.',
  soilTemp: 'Temperatura de la superficie del suelo. Afecta germinación y estrés de cultivos.',
} as const
