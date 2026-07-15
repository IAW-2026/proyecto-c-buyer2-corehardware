import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/auth'
import { auth } from '@clerk/nextjs/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const apiKeyValida = validateApiKey(req)
  const { userId } = await auth()

  if (!apiKeyValida && !userId) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
  }

  if (!id || id.trim() === '') {
    return NextResponse.json({ message: 'ID de pedido inválido' }, { status: 400 })
  }

  const pedido = await prisma.pedido.findUnique({ where: { id } })
  if (!pedido) return NextResponse.json({ message: 'Pedido no encontrado' }, { status: 404 })

  if (userId && !apiKeyValida) {
    const comprador = await prisma.comprador.findUnique({ where: { clerkUserId: userId } })
    if (!comprador || comprador.id !== pedido.compradorId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 })
    }
  }

  return NextResponse.json({
    id: pedido.id,
    fecha: pedido.fecha,
    comprador_id: pedido.compradorId,
    vendedor_id: pedido.vendedorId,
    productos: pedido.productosId,
    monto: pedido.monto,
    estado: pedido.estado,
    envio_id: pedido.envioId,
  })
}