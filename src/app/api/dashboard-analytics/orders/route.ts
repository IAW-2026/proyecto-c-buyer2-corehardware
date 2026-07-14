import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { validateApiKey } from '@/lib/auth';

const ESTADO_SORT_ORDER = [
    'PENDIENTE_PAGO',
    'PAGO_APROBADO',
    'EN_PREPARACION',
    'EN_CAMINO',
    'ENTREGADO',
    'PAGO_RECHAZADO',
    'CANCELADO',
] as const;

const SORTABLE_FIELDS = ['fecha', 'monto', 'estado'] as const;
type SortableField = (typeof SORTABLE_FIELDS)[number];

function parseSortBy(value: string | null): SortableField {
    return SORTABLE_FIELDS.includes(value as SortableField) ? (value as SortableField) : 'fecha';
}

function parseSortDir(value: string | null): 'asc' | 'desc' {
    return value === 'asc' ? 'asc' : 'desc';
}

function parseDateBoundary(value: string | null, endOfDay: boolean): Date | undefined {
    if (!value) return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return undefined;
    if (endOfDay) date.setHours(23, 59, 59, 999);
    return date;
}

// Prisma no soporta ORDER BY con lista de valores arbitraria (orden de flujo
// de negocio) a través de su API tipada, así que estado se resuelve con un
// CASE WHEN armado a mano. fecha/monto también se resuelven acá para no
// tener dos caminos de ordenamiento distintos en el mismo endpoint.
function buildOrderByClause(sortBy: SortableField, sortDir: 'asc' | 'desc'): Prisma.Sql {
    const direction = sortDir === 'asc' ? Prisma.sql`ASC` : Prisma.sql`DESC`;

    if (sortBy === 'fecha') return Prisma.sql`ORDER BY "fecha" ${direction}`;
    if (sortBy === 'monto') return Prisma.sql`ORDER BY "monto" ${direction}`;

    const whens = ESTADO_SORT_ORDER.map(
        (estado, index) => Prisma.sql`WHEN ${estado} THEN ${index}`
    );
    return Prisma.sql`ORDER BY CASE "estado" ${Prisma.join(whens, ' ')} ELSE ${ESTADO_SORT_ORDER.length} END ${direction}`;
}

function buildWhereClause(
    estados: string[] | undefined,
    fechaDesde: Date | undefined,
    fechaHasta: Date | undefined
): Prisma.Sql {
    const conditions: Prisma.Sql[] = [];

    if (estados && estados.length > 0) {
        conditions.push(Prisma.sql`"estado" IN (${Prisma.join(estados)})`);
    }
    if (fechaDesde) {
        conditions.push(Prisma.sql`"fecha" >= ${fechaDesde}`);
    }
    if (fechaHasta) {
        conditions.push(Prisma.sql`"fecha" <= ${fechaHasta}`);
    }

    if (conditions.length === 0) return Prisma.sql`TRUE`;
    return Prisma.join(conditions, ' AND ');
}

type PedidoRow = {
    id: string;
    fecha: Date;
    compradorId: string;
    vendedorId: string;
    monto: number;
    subtotalProductos: number | null;
    costoEnvio: number | null;
    estado: string;
    productosId: string[];
};

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
    const sortBy = parseSortBy(searchParams.get('sortBy'));
    const sortDir = parseSortDir(searchParams.get('sortDir'));

    const estados = estadoParam
        ? estadoParam.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined;

    const whereClause = buildWhereClause(estados, fechaDesde, fechaHasta);
    const orderByClause = buildOrderByClause(sortBy, sortDir);

    const [pedidos, totalResult] = await Promise.all([
        prisma.$queryRaw<PedidoRow[]>(Prisma.sql`
            SELECT "id", "fecha", "compradorId", "vendedorId", "monto",
                   "subtotalProductos", "costoEnvio", "estado", "productosId"
            FROM "Pedido"
            WHERE ${whereClause}
            ${orderByClause}
            LIMIT ${limit} OFFSET ${offset}
        `),
        prisma.$queryRaw<{ count: bigint }[]>(Prisma.sql`
            SELECT COUNT(*) as count FROM "Pedido" WHERE ${whereClause}
        `),
    ]);

    const total = Number(totalResult[0]?.count ?? 0);

    const items = pedidos.map((p) => ({
        id: p.id,
        fecha: p.fecha,
        comprador_id: p.compradorId,
        vendedor_id: p.vendedorId,
        monto: p.monto,
        subtotal_productos: p.subtotalProductos,
        costo_envio: p.costoEnvio,
        estado: p.estado,
        productos_id: p.productosId,
    }));

    return NextResponse.json({ items, total, limit, offset });
}