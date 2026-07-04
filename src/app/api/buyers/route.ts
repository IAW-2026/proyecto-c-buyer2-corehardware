import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateApiKey } from '@/lib/auth';

export async function GET(req: NextRequest) {
    if (!validateApiKey(req)) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const compradores = await prisma.comprador.findMany({
        where: { isDeleted: false },
        orderBy: { apellido: 'asc' },
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