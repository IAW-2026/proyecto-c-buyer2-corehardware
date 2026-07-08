import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateApiKey } from '@/lib/auth';

export async function GET(req: NextRequest) {
    if (!validateApiKey(req)) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const offsetParam = searchParams.get('offset');
    const limitParam = searchParams.get('limit');

    const offset = offsetParam !== null && !Number.isNaN(Number(offsetParam)) ? Number(offsetParam) : 0;
    const limit = limitParam !== null && !Number.isNaN(Number(limitParam)) ? Number(limitParam) : undefined;

    const where = {
        isDeleted: false,
        ...(q ? { id: { contains: q, mode: 'insensitive' as const } } : {}),
    };

    const [compradores, total] = await Promise.all([
        prisma.comprador.findMany({
            where,
            orderBy: { apellido: 'asc' },
            skip: offset,
            ...(limit !== undefined ? { take: limit } : {}),
        }),
        prisma.comprador.count({ where }),
    ]);

    const respuesta = {
        buyers: compradores.map((b) => ({
            id: b.id,
            dni: b.dni,
            cuil_cuit: b.cuilCuit,
            apellido: b.apellido,
            nombre: b.nombre,
            direccion: b.direccion,
            mail: b.mail,
            celular: b.celular,
            condicion_iva: b.condicionIva,
        })),
        total,
        offset,
        limit: limit ?? total,
    };

    return NextResponse.json(respuesta, { status: 200 });
}