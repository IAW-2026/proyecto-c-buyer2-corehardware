export function formatFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires',
  })
}

export function formatFechaConHora(fecha: string): string {
  return new Date(fecha).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
  })
}

export function formatFechaLarga(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'long', year: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires',
  })
}