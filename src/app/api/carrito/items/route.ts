import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const carritoItemSchema = z.object({
  productoId:  z.string().min(1, 'productoId es requerido'),
  nombre:      z.string().min(1, 'nombre es requerido'),
  precio:      z.number().positive('precio debe ser mayor a cero'),
  imagen:      z.string().optional(),
  cantidad:    z.number().int().positive().optional().default(1),
  vendedorId:  z.string().min(1, 'vendedorId es requerido'),
})

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ message: 'No autorizado' }, { status: 401 })

  const comprador = await prisma.comprador.findUnique({ where: { clerkUserId: userId } })
  if (!comprador) return NextResponse.json({ message: 'Comprador no encontrado' }, { status: 404 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'Body inválido' }, { status: 400 })
  }

  const result = carritoItemSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { message: 'Datos inválidos', detalles: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { productoId, nombre, precio, imagen, cantidad, vendedorId } = result.data

  let carrito = await prisma.carrito.findUnique({ where: { compradorId: comprador.id } })
  if (!carrito) {
    carrito = await prisma.carrito.create({ data: { compradorId: comprador.id } })
  }

  const itemExistente = await prisma.carritoItem.findFirst({
    where: { carritoId: carrito.id, productoId },
  })

  if (itemExistente) {
    const actualizado = await prisma.carritoItem.update({
      where: { id: itemExistente.id },
      data: { cantidad: itemExistente.cantidad + cantidad },
    })
    return NextResponse.json(actualizado)
  }

  const nuevoItem = await prisma.carritoItem.create({
    data: { carritoId: carrito.id, productoId, nombre, precio, imagen, cantidad, vendedorId },
  })

  return NextResponse.json(nuevoItem, { status: 201 })
}