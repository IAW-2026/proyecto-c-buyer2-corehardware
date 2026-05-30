/**
 * GET /api/orders
 *
 * Devuelve el historial de pedidos del comprador autenticado.
 * Usado por el frontend de Buyer App (no es un endpoint inter-servicios).
 *
 * Autenticación: JWT de Clerk (el comprador logueado)
 *
 * Query params opcionales:
 *   ?estado=EN_CAMINO        → filtra por estado
 *   ?limit=10&offset=0       → paginación
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  // 1. Verificar sesión de Clerk
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
  }

  // 2. Buscar el comprador por clerkUserId
  const comprador = await prisma.comprador.findUnique({
    where: { clerkUserId: userId },
  })

  if (!comprador || comprador.isDeleted) {
    return NextResponse.json({ message: 'Comprador no encontrado' }, { status: 404 })
  }

  // 3. Leer query params
  const { searchParams } = new URL(req.url)
  const estado = searchParams.get('estado') ?? undefined
  const limit = parseInt(searchParams.get('limit') ?? '10')
  const offset = parseInt(searchParams.get('offset') ?? '0')

  // 4. Buscar pedidos con filtros opcionales
  const [pedidos, total] = await Promise.all([
    prisma.pedido.findMany({
      where: {
        compradorId: comprador.id,
        ...(estado ? { estado } : {}),
      },
      orderBy: { fecha: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.pedido.count({
      where: {
        compradorId: comprador.id,
        ...(estado ? { estado } : {}),
      },
    }),
  ])

  // 5. Formatear respuesta
  const respuesta = pedidos.map((p) => ({
    id: p.id,
    fecha: p.fecha,
    comprador_id: p.compradorId,
    vendedor_id: p.vendedorId,
    productos: p.productosId,
    monto: p.monto,
    estado: p.estado,
    envio_id: p.envioId,
  }))

  return NextResponse.json({
    items: respuesta,
    total,
    limit,
    offset,
  })
}