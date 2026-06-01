import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// PATCH /api/carrito/items/[id] — cambiar cantidad
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ message: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const { cantidad } = await req.json()

  if (!cantidad || cantidad < 1) {
    return NextResponse.json({ message: 'Cantidad inválida' }, { status: 400 })
  }

  const item = await prisma.carritoItem.update({
    where: { id: parseInt(id) },
    data: { cantidad },
  })

  return NextResponse.json(item)
}

// DELETE /api/carrito/items/[id] — quitar item
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ message: 'No autorizado' }, { status: 401 })

  const { id } = await params

  await prisma.carritoItem.delete({ where: { id: parseInt(id) } })

  return NextResponse.json({ ok: true })
}