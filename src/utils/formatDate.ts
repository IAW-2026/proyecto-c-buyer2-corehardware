import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { es } from 'date-fns/locale'

const TZ = 'America/Argentina/Buenos_Aires'

function toBA(fecha: string): Date {
  const normalized = fecha.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(fecha)
    ? fecha
    : fecha + 'Z'
  return toZonedTime(new Date(normalized), TZ)
}

export function formatFecha(fecha: string): string {
  return format(toBA(fecha), 'dd/MM/yyyy')
}

export function formatFechaConHora(fecha: string): string {
  return format(toBA(fecha), 'dd/MM/yyyy, HH:mm')
}

export function formatFechaLarga(fecha: string): string {
  return format(toBA(fecha), "dd 'de' MMMM 'de' yyyy", { locale: es })
}