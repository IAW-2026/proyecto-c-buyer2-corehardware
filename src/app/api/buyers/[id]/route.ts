import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!validateApiKey(req)) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
  }

  if (!id || id.trim() === '') {
    return NextResponse.json({ message: 'ID de comprador inválido' }, { status: 400 })
  }

  const comprador = await prisma.comprador.findUnique({ where: { id } })
  if (!comprador) {
    return NextResponse.json({ message: 'Comprador no encontrado' }, { status: 404 })
  }

  return NextResponse.json({
    id: comprador.id,
    dni: comprador.dni,
    cuil_cuit: comprador.cuilCuit,
    apellido: comprador.apellido,
    nombre: comprador.nombre,
    direccion: comprador.direccion,
    mail: comprador.mail,
    celular: comprador.celular,
    condicion_iva: comprador.condicionIva,
    id_clerk: comprador.clerkUserId,
  })
}