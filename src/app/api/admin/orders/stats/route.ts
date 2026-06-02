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

    const [total, entregados, enCamino, pendientes] = await Promise.all([
        prisma.pedido.count(),
        prisma.pedido.count({ where: { estado: 'ENTREGADO' } }),
        prisma.pedido.count({ where: { estado: 'EN_CAMINO' } }),
        prisma.pedido.count({ where: { estado: 'PENDIENTE_PAGO' } }),
    ])

    return NextResponse.json({ total, entregados, enCamino, pendientes })
}