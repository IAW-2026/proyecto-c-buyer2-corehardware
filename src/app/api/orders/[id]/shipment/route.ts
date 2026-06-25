import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/auth'
import { z } from 'zod'

const shipmentSchema = z.object({
  shipmentID: z.string().min(1, 'shipmentID es requerido'),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!validateApiKey(req)) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
  }

  if (!id || id.trim() === '') {
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

  const pedido = await prisma.pedido.findUnique({ where: { id } })
  if (!pedido) {
    return NextResponse.json({ message: 'Pedido no encontrado' }, { status: 404 })
  }

  if (pedido.envioId !== null) {
    console.log(`409: pedido ${id} ya tiene envioId ${pedido.envioId}`)
    return NextResponse.json({ message: 'El pedido ya tiene un envío asignado' }, { status: 409 })
  }

  if (pedido.estado !== 'PAGO_APROBADO') {
    console.log(`409: pedido ${id} tiene estado ${pedido.estado}`)
    return NextResponse.json({ message: 'El pedido debe estar en estado PAGO_APROBADO' }, { status: 409 })
  }

  try {
    await prisma.pedido.update({
      where: { id },
      data: { envioId: result.data.shipmentID },
    })
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ message: 'Error al actualizar envío' }, { status: 409 })
  }
}