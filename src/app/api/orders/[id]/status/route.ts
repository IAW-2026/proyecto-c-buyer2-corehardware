import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/auth'
import { z } from 'zod'

const ESTADOS_VALIDOS = [
  'PENDIENTE_PAGO',
  'PAGO_APROBADO',
  'PAGO_RECHAZADO',
  'EN_PREPARACION',
  'EN_CAMINO',
  'ENTREGADO',
  'CANCELADO',
] as const

const TRANSICIONES: Record<string, string[]> = {
  PENDIENTE_PAGO:  ['PAGO_APROBADO', 'PAGO_RECHAZADO', 'CANCELADO'],
  PAGO_APROBADO:   ['EN_PREPARACION', 'CANCELADO'],
  PAGO_RECHAZADO:  ['CANCELADO'],
  EN_PREPARACION:  ['EN_CAMINO', 'CANCELADO'],
  EN_CAMINO:       ['ENTREGADO', 'CANCELADO'],
  ENTREGADO:       [],
  CANCELADO:       [],
}

const statusSchema = z.object({
  estado: z.enum(ESTADOS_VALIDOS).refine(
    (val) => ESTADOS_VALIDOS.includes(val as typeof ESTADOS_VALIDOS[number]),
    { message: `Estado inválido. Estados válidos: ${ESTADOS_VALIDOS.join(', ')}` }
  ),
})

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id || id.trim() === '') {
    return NextResponse.json({ message: 'ID de pedido inválido' }, { status: 400 })
  }

  if (!validateApiKey(req)) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'Body inválido' }, { status: 400 })
  }

  const result = statusSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { message: 'Datos inválidos', detalles: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { estado: nuevoEstado } = result.data

  const pedidoActual = await prisma.pedido.findUnique({ where: { id } })
  if (!pedidoActual) {
    return NextResponse.json({ message: 'Pedido no encontrado' }, { status: 404 })
  }

  const transicionesPermitidas = TRANSICIONES[pedidoActual.estado] ?? []
  if (!transicionesPermitidas.includes(nuevoEstado)) {
    return NextResponse.json(
      { message: `Transición inválida: no se puede pasar de ${pedidoActual.estado} a ${nuevoEstado}` },
      { status: 409 }
    )
  }

  if (['EN_CAMINO', 'ENTREGADO'].includes(nuevoEstado) && !pedidoActual.envioId) {
    return NextResponse.json(
      { message: `No se puede pasar a ${nuevoEstado} sin un envío asignado` },
      { status: 409 }
    )
  }

  try {
    const pedidoActualizado = await prisma.pedido.update({
      where: { id },
      data: { estado: nuevoEstado },
    })

    return NextResponse.json({
      id:           pedidoActualizado.id,
      estado:       pedidoActualizado.estado,
      fecha:        pedidoActualizado.fecha,
      comprador_id: pedidoActualizado.compradorId,
      vendedor_id:  pedidoActualizado.vendedorId,
      productos:    pedidoActualizado.productosId,
      monto:        pedidoActualizado.monto,
      envio_id:     pedidoActualizado.envioId,
    })
  } catch {
    return NextResponse.json(
      { message: 'Error al actualizar el estado del pedido' },
      { status: 500 }
    )
  }
}