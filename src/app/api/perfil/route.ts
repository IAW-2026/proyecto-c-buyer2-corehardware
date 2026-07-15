import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const perfilSchema = z.object({
  nombre: z.string().min(2, 'Nombre inválido'),
  apellido: z.string().min(2, 'Apellido inválido'),
  dni: z.string().min(7, 'DNI inválido').max(8, 'DNI inválido'),
  cuilCuit: z.string().refine((v) => {
    const soloNumeros = v.replace(/-/g, '')
    return /^\d{2}\d{7,8}\d{1}$/.test(soloNumeros)
  }, 'Formato de CUIL/CUIT inválido'),
  celular: z.string().min(8, 'Celular inválido'),
  direccion: z.string().min(5, 'Dirección inválida'),
  fechaNacimiento: z.string().refine((v) => {
    if (isNaN(Date.parse(v))) return false
    const fecha = new Date(v)
    const hoy = new Date()
    const anio = fecha.getFullYear()
    const edadMinima = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate())
    return anio >= 1900 && fecha <= edadMinima
  }, 'Fecha inválida. Debés tener al menos 18 años.'),
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

  const soloNumerosCuil = cuilCuit.replace(/-/g, '')
  if (!soloNumerosCuil.includes(dni)) {
    return NextResponse.json(
      { error: 'Datos inválidos', detalles: { cuilCuit: ['El CUIL/CUIT debe contener el DNI'] } },
      { status: 400 }
    )
  }

  const cuilExistente = await prisma.comprador.findFirst({
    where: { cuilCuit, isDeleted: false, NOT: { clerkUserId: userId } },
  })
  if (cuilExistente) {
    return NextResponse.json({ error: 'El CUIL/CUIT ya está registrado' }, { status: 409 })
  }

  const clerkUser = await currentUser()

  let comprador
  try {
    comprador = await prisma.comprador.upsert({
      where: { clerkUserId: userId },
      update: {
        nombre, apellido, dni, cuilCuit, celular, direccion,
        fechaNacimiento: new Date(fechaNacimiento),
        nacionalidad, sexo: sexo ?? null, condicionIva,
        perfilCompleto: true,
      },
      create: {
        clerkUserId: userId,
        mail: clerkUser?.emailAddresses[0]?.emailAddress ?? '',
        nombre, apellido, dni, cuilCuit, celular, direccion,
        fechaNacimiento: new Date(fechaNacimiento),
        nacionalidad, sexo: sexo ?? null, condicionIva,
        isDeleted: false,
        perfilCompleto: true,
      },
    })
  } catch (err: any) {
    if (err.code === 'P2002') {
      const campo = err.meta?.driverAdapterError?.cause?.constraint?.fields?.[0] ?? 'campo'
      const mensajes: Record<string, string> = {
        dni: 'El DNI ya está registrado con otra cuenta.',
        cuilCuit: 'El CUIL/CUIT ya está registrado con otra cuenta.',
        mail: 'El email ya está registrado con otra cuenta.',
      }
      return NextResponse.json(
        { error: mensajes[campo] ?? `El ${campo} ya está en uso.` },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Error al guardar el perfil' }, { status: 500 })
  }

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