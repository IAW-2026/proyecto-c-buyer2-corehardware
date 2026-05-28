import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json(null, { status: 401 })

  const comprador = await prisma.comprador.findUnique({
    where: { clerkUserId: userId },
    select: {
      id: true,
      nombre: true,
      apellido: true,
      mail: true,
      dni: true,
    },
  })

  if (!comprador) return NextResponse.json(null, { status: 404 })

  const perfilCompleto = comprador.dni !== ''

  return NextResponse.json({ ...comprador, perfilCompleto })
}