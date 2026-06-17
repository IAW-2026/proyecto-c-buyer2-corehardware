/**
 * GET /api/admin/orders
 *
 * Solo accesible por usuarios con rol "admin".
 * Devuelve todos los pedidos con filtros opcionales y combinables.
 *
 * Query params opcionales:
 *   ?estado=EN_CAMINO
 *   ?compradorId=5
 *   ?fechaDesde=2026-01-01
 *   ?fechaHasta=2026-12-31
 *   ?limit=20&offset=0
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  // 1. Verificar autenticación y rol admin
  const { userId, sessionClaims } = await auth()
  if (!userId) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
  }

  const role = (sessionClaims?.metadata as Record<string, unknown>)?.role
  if (role !== 'admin') {
    return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 })
  }
  // 2. Leer query params
  const { searchParams } = new URL(req.url)
  const estado = searchParams.get('estado') ?? undefined
  const compradorNombre = searchParams.get('compradorNombre') ?? undefined
  const fechaDesde = searchParams.get('fechaDesde') ?? undefined
  const fechaHasta = searchParams.get('fechaHasta') ?? undefined
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100)
  const offset = Math.max(parseInt(searchParams.get('offset') ?? '0'), 0)

  // 3. Construir filtro — todos los campos son opcionales y combinables
  const where = {
    ...(estado ? { estado } : {}),
    ...(compradorNombre ? {
      comprador: {
        OR: [
          { nombre: { contains: compradorNombre, mode: 'insensitive' as const } },
          { apellido: { contains: compradorNombre, mode: 'insensitive' as const } },
        ]
      }
    } : {}),
    ...(fechaDesde || fechaHasta ? {
      fecha: {
        ...(fechaDesde ? { gte: new Date(fechaDesde) } : {}),
        ...(fechaHasta ? { lte: new Date(fechaHasta + 'T23:59:59') } : {}),
      },
    } : {}),
  }

  // 4. Consultar BD en paralelo
  const [pedidos, total] = await Promise.all([
    prisma.pedido.findMany({
      where,
      orderBy: { fecha: 'desc' },
      take: limit,
      skip: offset,
      include: {
        comprador: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            mail: true,
          },
        },
      },
    }),
    prisma.pedido.count({ where }),
  ])

  // 5. Formatear respuesta
  const items = pedidos.map((p) => ({
    id: p.id,
    fecha: p.fecha,
    monto: p.monto,
    estado: p.estado,
    vendedor_id: p.vendedorId,
    envio_id: p.envioId,
    productos: p.productosId,
    comprador: {
      id: p.comprador.id,
      nombre: `${p.comprador.nombre} ${p.comprador.apellido}`,
      mail: p.comprador.mail,
    },
  }))

  return NextResponse.json({ items, total, limit, offset })
}