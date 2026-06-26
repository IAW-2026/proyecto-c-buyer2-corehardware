import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ completo: false }, { status: 401 })
  }

  const comprador = await prisma.comprador.findUnique({
    where: { clerkUserId: userId },
  })

  if (!comprador) {
    return NextResponse.json({ completo: false, deleted: false })
  }

  if (comprador.isDeleted) {
    return NextResponse.json({ completo: false, deleted: true })
  }

  return NextResponse.json({ completo: comprador.perfilCompleto })
}