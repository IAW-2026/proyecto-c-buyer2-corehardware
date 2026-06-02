import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const { userId, sessionClaims } = await auth()
    if (!userId) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const role = (sessionClaims?.metadata as Record<string, unknown>)?.role
    if (role !== 'admin') {
        return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') ?? undefined
    const limit  = Math.min(parseInt(searchParams.get('limit')  ?? '20'), 100)
    const offset = Math.max(parseInt(searchParams.get('offset') ?? '0'),  0)

    const where = {
        isDeleted: false,
        ...(search ? {
            OR: [
                { nombre:   { contains: search, mode: 'insensitive' as const } },
                { apellido: { contains: search, mode: 'insensitive' as const } },
                { mail:     { contains: search, mode: 'insensitive' as const } },
                { dni:      { contains: search, mode: 'insensitive' as const } },
            ],
        } : {}),
    }

    const [compradores, total] = await Promise.all([
        prisma.comprador.findMany({
            where,
            orderBy: { apellido: 'asc' },
            take: limit,
            skip: offset,
            select: {
                id:              true,
                nombre:          true,
                apellido:        true,
                mail:            true,
                dni:             true,
                cuilCuit:        true,
                celular:         true,
                direccion:       true,
                nacionalidad:    true,
                sexo:            true,
                fechaNacimiento: true,
                condicionIva:    true,
                _count: { select: { pedidos: true } },
            },
        }),
        prisma.comprador.count({ where }),
    ])

    const items = compradores.map(c => ({
        id:              c.id,
        nombre:          c.nombre,
        apellido:        c.apellido,
        mail:            c.mail,
        dni:             c.dni,
        cuilCuit:        c.cuilCuit,
        celular:         c.celular,
        direccion:       c.direccion,
        nacionalidad:    c.nacionalidad,
        sexo:            c.sexo,
        fechaNacimiento: c.fechaNacimiento,
        condicionIva:    c.condicionIva,
        totalPedidos:    c._count.pedidos,
    }))

    return NextResponse.json({ items, total, limit, offset })
}