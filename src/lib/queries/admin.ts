import { prisma } from '@/lib/prisma'

// ── Tipos ──────────────────────────────────────────────────────────────────

export interface TopComprador {
  posicion: number
  comprador: { id: string; nombre: string; apellido: string; mail: string } | null
  totalPedidos: number
  totalMonto: number
}

export interface DashboardStats {
  total: number
  entregados: number
  enCamino: number
  pendientes: number
}

// ── Queries ────────────────────────────────────────────────────────────────

export async function getTopCompradores(): Promise<TopComprador[]> {
  const raw = await prisma.comprador.findMany({
    where: { isDeleted: false },
    select: {
      id: true,
      nombre: true,
      apellido: true,
      mail: true,
      pedidos: { select: { monto: true } },
    },
  })

  return raw
    .map((c) => ({
      comprador: { id: c.id, nombre: c.nombre, apellido: c.apellido, mail: c.mail },
      totalPedidos: c.pedidos.length,
      totalMonto: c.pedidos.reduce((sum, p) => sum + (p.monto ?? 0), 0),
    }))
    .sort((a, b) => b.totalMonto - a.totalMonto)
    .slice(0, 10)
    .map((item, i) => ({ ...item, posicion: i + 1 }))
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [total, entregados, enCamino, pendientes] = await Promise.all([
    prisma.pedido.count(),
    prisma.pedido.count({ where: { estado: 'ENTREGADO' } }),
    prisma.pedido.count({ where: { estado: 'EN_CAMINO' } }),
    prisma.pedido.count({ where: { estado: 'PENDIENTE_PAGO' } }),
  ])
  return { total, entregados, enCamino, pendientes }
}