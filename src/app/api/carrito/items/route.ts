import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// POST /api/carrito/items — agregar item
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ message: 'No autorizado' }, { status: 401 })

  const comprador = await prisma.comprador.findUnique({ where: { clerkUserId: userId } })
  if (!comprador) return NextResponse.json({ message: 'Comprador no encontrado' }, { status: 404 })

  const { productoId, nombre, precio, imagen, cantidad, vendedorId } = await req.json()

  // Obtener o crear el carrito
  let carrito = await prisma.carrito.findUnique({ where: { compradorId: comprador.id } })
  if (!carrito) {
    carrito = await prisma.carrito.create({ data: { compradorId: comprador.id } })
  }

  // Si ya existe el item, incrementar cantidad
  const itemExistente = await prisma.carritoItem.findFirst({
    where: { carritoId: carrito.id, productoId },
  })

  if (itemExistente) {
    const actualizado = await prisma.carritoItem.update({
      where: { id: itemExistente.id },
      data: { cantidad: itemExistente.cantidad + (cantidad ?? 1) },
    })
    return NextResponse.json(actualizado)
  }

  const nuevoItem = await prisma.carritoItem.create({
    data: { carritoId: carrito.id, productoId, nombre, precio, imagen, cantidad: cantidad ?? 1, vendedorId },
  })

  return NextResponse.json(nuevoItem, { status: 201 })
}