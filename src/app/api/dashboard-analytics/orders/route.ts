import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateApiKey } from '@/lib/auth';

export async function GET(req: NextRequest) {
    if (!validateApiKey(req)) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const estado = searchParams.get('estado') ?? undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') ?? '0'), 0);

    const where = estado ? { estado } : {};

    const [pedidos, total] = await Promise.all([
        prisma.pedido.findMany({
            where,
            orderBy: { fecha: 'desc' },
            take: limit,
            skip: offset,
        }),
        prisma.pedido.count({ where }),
    ]);

    const items = pedidos.map((p) => ({
        id: p.id,
        fecha: p.fecha,
        comprador_id: p.compradorId,
        vendedor_id: p.vendedorId,
        monto: p.monto,
        estado: p.estado,
    }));

    return NextResponse.json({ items, total, limit, offset });
}