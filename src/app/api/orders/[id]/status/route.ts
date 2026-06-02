/**
 * PUT /api/orders/[id]/state
 *
 * Quién llama:
 *   - Payments App: cuando MercadoPago confirma/rechaza el pago
 *   - Shipping App: cuando el estado del envío cambia (EN_CAMINO, ENTREGADO)
 *
 * Autenticación: API Key (igual que el resto de endpoints inter-servicios)
 *
 * Transiciones válidas:
 *   PENDIENTE_PAGO  → PAGO_APROBADO | PAGO_RECHAZADO | CANCELADO
 *   PAGO_APROBADO   → EN_PREPARACION
 *   EN_PREPARACION  → EN_CAMINO
 *   EN_CAMINO       → ENTREGADO
 *   cualquiera      → CANCELADO
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/auth'

const ESTADOS_VALIDOS = [
  'PENDIENTE_PAGO',
  'PAGO_APROBADO',
  'PAGO_RECHAZADO',
  'EN_PREPARACION',
  'EN_CAMINO',
  'ENTREGADO',
  'CANCELADO',
] as const

// Transiciones permitidas — evita que alguien retroceda un estado
const TRANSICIONES: Record<string, string[]> = {
  PENDIENTE_PAGO: ['PAGO_APROBADO', 'PAGO_RECHAZADO', 'CANCELADO'],
  PAGO_APROBADO: ['EN_PREPARACION', 'CANCELADO'],
  PAGO_RECHAZADO: ['CANCELADO'],
  EN_PREPARACION: ['EN_CAMINO', 'CANCELADO'],
  EN_CAMINO: ['ENTREGADO', 'CANCELADO'],
  ENTREGADO: [],
  CANCELADO: [],
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const pedidoId = parseInt(id)
  if (isNaN(pedidoId) || pedidoId <= 0) {
    return NextResponse.json({ message: 'ID de pedido inválido' }, { status: 400 })
  }

  // 1. Validar API Key
  if (!validateApiKey(req)) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
  }

  // 2. Parsear body
  let body: { estado: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'Body inválido' }, { status: 400 })
  }

  const { estado: nuevoEstado } = body

  // 3. Validar que el estado enviado es uno de los estados conocidos
  if (!ESTADOS_VALIDOS.includes(nuevoEstado as typeof ESTADOS_VALIDOS[number])) {
    return NextResponse.json(
      { message: `Estado inválido: ${nuevoEstado}. Estados válidos: ${ESTADOS_VALIDOS.join(', ')}` },
      { status: 400 }
    )
  }

  // 4. Buscar el pedido
  const pedidoActual = await prisma.pedido.findUnique({
    where: { id: pedidoId },
  })

  if (!pedidoActual) {
    return NextResponse.json({ message: 'Pedido no encontrado' }, { status: 404 })
  }

  // 5. Validar que la transición es permitida
  const transicionesPermitidas = TRANSICIONES[pedidoActual.estado] ?? []
  if (!transicionesPermitidas.includes(nuevoEstado)) {
    return NextResponse.json(
      {
        message: `Transición inválida: no se puede pasar de ${pedidoActual.estado} a ${nuevoEstado}`,
      },
      { status: 409 }
    )
  }

  // 6. Validar envio_id para estados que lo requieren
  if (['EN_CAMINO', 'ENTREGADO'].includes(nuevoEstado) && !pedidoActual.envioId) {
    return NextResponse.json(
      { message: `No se puede pasar a ${nuevoEstado} sin un envío asignado (envio_id es null)` },
      { status: 409 }
    )
  }

  // 7. Actualizar el estado
  try {
    const pedidoActualizado = await prisma.pedido.update({
      where: { id: pedidoId },
      data: { estado: nuevoEstado },
    })

    return NextResponse.json({
      id: pedidoActualizado.id,
      estado: pedidoActualizado.estado,
      fecha: pedidoActualizado.fecha,
      comprador_id: pedidoActualizado.compradorId,
      vendedor_id: pedidoActualizado.vendedorId,
      productos: pedidoActualizado.productosId,
      monto: pedidoActualizado.monto,
      envio_id: pedidoActualizado.envioId,
    })
  } catch {
    return NextResponse.json(
      { message: 'Error al actualizar el estado del pedido' },
      { status: 409 }
    )
  }
}