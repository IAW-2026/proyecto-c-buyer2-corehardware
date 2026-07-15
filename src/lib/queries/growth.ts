import { prisma } from '@/lib/prisma'

// ── Tipos ──────────────────────────────────────────────────────────────────

export interface GrowthItem {
  fecha: string // YYYY-MM-DD
  cantidad: number
}

export interface GrowthResult {
  total: number
  items: GrowthItem[]
}

// ── Queries ────────────────────────────────────────────────────────────────

/**
 * Cuenta altas de Comprador por día dentro de [from, to] (inclusive).
 * Agrupa en JS (no en SQL) para mantener el mismo patrón que Seller:
 * un solo findMany, Map<fecha, cantidad>, y relleno de días vacíos con 0
 * para que el gráfico no tenga huecos.
 *
 * from/to deben venir ya normalizados por el caller (inicio y fin de día
 * respectivamente) — esta función no ajusta horas.
 */
export async function getCompradorGrowthForRange(
  from: Date,
  to: Date
): Promise<GrowthResult> {
  const compradores = await prisma.comprador.findMany({
    where: {
      createdAt: { gte: from, lte: to },
      isDeleted: false,
    },
    select: { createdAt: true },
  })

  const countByDay = new Map<string, number>()
  for (const c of compradores) {
    const key = c.createdAt.toISOString().slice(0, 10) // YYYY-MM-DD
    countByDay.set(key, (countByDay.get(key) ?? 0) + 1)
  }

  const items: GrowthItem[] = []
  const cursor = new Date(from)
  cursor.setUTCHours(0, 0, 0, 0)
  const end = new Date(to)
  end.setUTCHours(0, 0, 0, 0)

  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10)
    items.push({ fecha: key, cantidad: countByDay.get(key) ?? 0 })
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  return { total: compradores.length, items }
}