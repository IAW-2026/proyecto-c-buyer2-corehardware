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
    // No existe todavía en la DB (puede pasar si el webhook aún no se disparó)
    return NextResponse.json({ completo: false })
  }

  // Un perfil está completo si tiene los campos obligatorios rellenos
  const completo =
    comprador.dni !== '' &&
    comprador.cuilCuit !== '' &&
    comprador.direccion !== '' &&
    comprador.celular !== '' &&
    comprador.nacionalidad !== '' &&
    comprador.fechaNacimiento.getFullYear() !== 1900

  return NextResponse.json({ completo })
}
