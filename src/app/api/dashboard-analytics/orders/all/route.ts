import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateApiKey } from '@/lib/auth';

export async function GET(req: NextRequest) {
    if (!validateApiKey(req)) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const pedidos = await prisma.pedido.findMany({
        orderBy: { fecha: 'desc' },
    });

    const respuesta = pedidos.map((p) => ({
        id: p.id,
        fecha: p.fecha,
        comprador_id: p.compradorId,
        vendedor_id: p.vendedorId,
        monto: p.monto,
        estado: p.estado,
    }));

    return NextResponse.json(respuesta, { status: 200 });
}