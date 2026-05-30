import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/auth'
import { auth } from '@clerk/nextjs/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Autenticación: API Key (otras apps) o JWT de Clerk (frontend propio)
  const apiKeyValida = validateApiKey(req)
  const { userId } = await auth()

  if (!apiKeyValida && !userId) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
  }

  const pedido = await prisma.pedido.findUnique({ where: { id: parseInt(id) } })
  if (!pedido) return NextResponse.json({ message: 'Pedido no encontrado' }, { status: 404 })

  // Si es llamada con JWT de Clerk, verificar que el pedido pertenece al comprador
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