import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/auth'
import { z } from 'zod'

const shipmentSchema = z.object({
  shipmentID: z.number().min(1, 'shipmentID es requerido y debe ser positivo')
    .int('shipmentID debe ser entero')
    .positive('shipmentID debe ser positivo'),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!validateApiKey(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const pedidoId = parseInt(id)
  if (isNaN(pedidoId) || pedidoId <= 0) {
    return NextResponse.json({ message: 'ID de pedido inválido' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'Body inválido' }, { status: 400 })
  }

  const result = shipmentSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { message: 'Datos inválidos', detalles: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const pedido = await prisma.pedido.findUnique({ where: { id: pedidoId } })
  if (!pedido) {
    return NextResponse.json({ message: 'Pedido no encontrado' }, { status: 404 })
  }

  try {
    await prisma.pedido.update({
      where: { id: pedidoId },
      data: { envioId: result.data.shipmentID },
    })
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ message: 'Error al actualizar envío' }, { status: 409 })
  }
}