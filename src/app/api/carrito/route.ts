import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// GET /api/carrito — cargar carrito del usuario
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ message: 'No autorizado' }, { status: 401 })

  const comprador = await prisma.comprador.findUnique({ where: { clerkUserId: userId } })
  if (!comprador) return NextResponse.json({ message: 'Comprador no encontrado' }, { status: 404 })

  const carrito = await prisma.carrito.findUnique({
    where: { compradorId: comprador.id },
    include: { items: true },
  })

  return NextResponse.json({ items: carrito?.items ?? [] })
}

// DELETE /api/carrito — limpiar carrito completo
export async function DELETE() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ message: 'No autorizado' }, { status: 401 })

  const comprador = await prisma.comprador.findUnique({ where: { clerkUserId: userId } })
  if (!comprador) return NextResponse.json({ message: 'Comprador no encontrado' }, { status: 404 })

  const carrito = await prisma.carrito.findUnique({ where: { compradorId: comprador.id } })
  if (carrito) {
    await prisma.carritoItem.deleteMany({ where: { carritoId: carrito.id } })
  }

  return NextResponse.json({ ok: true })
}