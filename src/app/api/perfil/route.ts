import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const perfilSchema = z.object({
  nombre: z.string().min(2, 'Nombre inválido'),
  apellido: z.string().min(2, 'Apellido inválido'),
  dni: z.string().min(7, 'DNI inválido').max(8, 'DNI inválido'),
  cuilCuit: z.string().min(11, 'CUIL/CUIT inválido').max(13, 'CUIL/CUIT inválido'),
  celular: z.string().min(8, 'Celular inválido'),
  direccion: z.string().min(5, 'Dirección inválida'),
  fechaNacimiento: z.string().refine((v) => !isNaN(Date.parse(v)), 'Fecha inválida'),
  nacionalidad: z.string().min(2, 'Nacionalidad inválida'),
  sexo: z.string().optional(),
  condicionIva: z.enum([
    'Consumidor Final',
    'Responsable Inscripto',
    'Monotributista',
    'Exento',
  ]),
})

// ── GET — obtener datos del comprador logueado ─────────────────────────────
export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const comprador = await prisma.comprador.findUnique({
    where: { clerkUserId: userId },
  })

  if (!comprador || comprador.isDeleted) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
  }

  return NextResponse.json({
    id: comprador.id,
    nombre: comprador.nombre,
    apellido: comprador.apellido,
    dni: comprador.dni,
    cuilCuit: comprador.cuilCuit,
    mail: comprador.mail,
    celular: comprador.celular,
    direccion: comprador.direccion,
    fechaNacimiento: comprador.fechaNacimiento.toISOString().split('T')[0],
    nacionalidad: comprador.nacionalidad,
    sexo: comprador.sexo ?? '',
    condicionIva: comprador.condicionIva,
  })
}

// ── PUT — actualizar datos del comprador ───────────────────────────────────
export async function PUT(req: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const body = await req.json()
  const result = perfilSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', detalles: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { nombre, apellido, dni, cuilCuit, celular, direccion, fechaNacimiento, nacionalidad, sexo, condicionIva } =
    result.data

  const dniExistente = await prisma.comprador.findFirst({
    where: { dni, isDeleted: false, NOT: { clerkUserId: userId } },
  })
  
  if (dniExistente) {
    return NextResponse.json({ error: 'El DNI ya está registrado' }, { status: 409 })
  }

  const clerkUser = await currentUser()

  const comprador = await prisma.comprador.upsert({
    where: { clerkUserId: userId },
    update: {
      nombre, apellido, dni, cuilCuit, celular, direccion,
      fechaNacimiento: new Date(fechaNacimiento),
      nacionalidad, sexo: sexo ?? null, condicionIva,
    },
    create: {
      clerkUserId: userId,
      mail: clerkUser?.emailAddresses[0]?.emailAddress ?? '',
      nombre, apellido, dni, cuilCuit, celular, direccion,
      fechaNacimiento: new Date(fechaNacimiento),
      nacionalidad, sexo: sexo ?? null, condicionIva,
      isDeleted: false,
    },
  })

  return NextResponse.json({ ok: true, compradorId: comprador.id })
}

// ── DELETE — soft delete del comprador ────────────────────────────────────
export async function DELETE() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const comprador = await prisma.comprador.findUnique({
    where: { clerkUserId: userId },
  })

  if (!comprador || comprador.isDeleted) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
  }

  await prisma.comprador.update({
    where: { clerkUserId: userId },
    data: { isDeleted: true },
  })

  return NextResponse.json({ ok: true })
}