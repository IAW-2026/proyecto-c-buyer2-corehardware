import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateApiKey } from '@/lib/auth';
import type { Prisma } from '@prisma/client';

function parseDateBoundary(value: string | null, endOfDay: boolean): Date | undefined {
    if (!value) return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return undefined;
    if (endOfDay) date.setHours(23, 59, 59, 999);
    return date;
}

export async function GET(req: NextRequest) {
    if (!validateApiKey(req)) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const estadoParam = searchParams.get('estado') ?? undefined;
    const fechaDesde = parseDateBoundary(searchParams.get('fechaDesde'), false);
    const fechaHasta = parseDateBoundary(searchParams.get('fechaHasta'), true);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') ?? '0'), 0);

    const estados = estadoParam
        ? estadoParam.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined;

    const where: Prisma.PedidoWhereInput = {};

    if (estados && estados.length > 0) {
        where.estado = { in: estados };
    }

    // Rango de fechas inclusivo en ambos extremos: fechaDesde a las 00:00:00
    // y fechaHasta a las 23:59:59.999 del día indicado.
    if (fechaDesde || fechaHasta) {
        where.fecha = {
            ...(fechaDesde ? { gte: fechaDesde } : {}),
            ...(fechaHasta ? { lte: fechaHasta } : {}),
        };
    }

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