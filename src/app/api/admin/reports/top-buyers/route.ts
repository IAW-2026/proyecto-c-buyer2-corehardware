import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    const { userId, sessionClaims } = await auth()
    if (!userId) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const role = (sessionClaims?.metadata as Record<string, unknown>)?.role
    if (role !== 'admin') {
        return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 })
    }

    const resultados = await prisma.pedido.groupBy({
        by: ['compradorId'],
        _sum: { monto: true },
        _count: { id: true },
        orderBy: { _sum: { monto: 'desc' } },
        take: 10,
    })

    const compradorIds = resultados.map(r => r.compradorId)
    const compradores = await prisma.comprador.findMany({
        where: { id: { in: compradorIds } },
        select: { id: true, nombre: true, apellido: true, mail: true },
    })

    const compradorMap = Object.fromEntries(compradores.map(c => [c.id, c]))

    const items = resultados.map((r, i) => ({
        posicion: i + 1,
        comprador: compradorMap[r.compradorId] ?? null,
        totalPedidos: r._count.id,
        totalMonto: r._sum.monto ?? 0,
    }))

    return NextResponse.json({ items })
}