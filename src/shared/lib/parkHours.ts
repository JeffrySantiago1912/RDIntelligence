import type { Park, ParkSchedule } from '@/data/parks'

const RD_TZ = 'America/Santo_Domingo'

/** Hora local de RD (sin depender del huso del navegador). */
export function getRdNowParts(date = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: RD_TZ,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  })
  const parts = fmt.formatToParts(date)
  const weekday = parts.find((p) => p.type === 'weekday')?.value ?? 'Mon'
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0)
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0)

  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  }

  return { day: dayMap[weekday] ?? 1, hour, minute }
}

export function isParkOpenNow(schedule: ParkSchedule, date = new Date()): boolean {
  const { day, hour, minute } = getRdNowParts(date)
  if (schedule.openDays.length > 0 && !schedule.openDays.includes(day)) return false

  const now = hour * 60 + minute
  const open = schedule.openHour * 60 + schedule.openMinute
  const close = schedule.closeHour * 60 + schedule.closeMinute

  if (close <= open) {
    // Cruza medianoche (poco frecuente en parques RD)
    return now >= open || now < close
  }
  return now >= open && now < close
}

export function parkOpenStatus(park: Park, date = new Date()) {
  const open = isParkOpenNow(park.schedule, date)
  return {
    open,
    label: open ? 'Abierto ahora' : 'Cerrado ahora',
    tone: open
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : 'bg-stone-100 text-stone-700 border-stone-200',
    hint: park.schedule.note ?? park.schedule.label,
  }
}

export function formatUpdatedAt(isoDate: string) {
  const d = new Date(`${isoDate}T12:00:00`)
  return new Intl.DateTimeFormat('es-DO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}
