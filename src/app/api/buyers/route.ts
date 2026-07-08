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

    const offset = offsetParam !== null && !Number.isNaN(Number(offsetParam)) ? Number(offsetParam) : undefined;
    const limit = limitParam !== null && !Number.isNaN(Number(limitParam)) ? Number(limitParam) : undefined;

    const compradores = await prisma.comprador.findMany({
        where: {
            isDeleted: false,
            ...(q ? { id: { contains: q, mode: 'insensitive' } } : {}),
        },
        orderBy: { apellido: 'asc' },
        ...(offset !== undefined ? { skip: offset } : {}),
        ...(limit !== undefined ? { take: limit } : {}),
    });

    const respuesta = compradores.map((b) => ({
        id: b.id,
        dni: b.dni,
        cuil_cuit: b.cuilCuit,
        apellido: b.apellido,
        nombre: b.nombre,
        direccion: b.direccion,
        mail: b.mail,
        celular: b.celular,
        condicion_iva: b.condicionIva,
    }));

    return NextResponse.json(respuesta, { status: 200 });
}