import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateApiKey } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    if (!validateApiKey(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const comprador = await prisma.comprador.findUnique({ where: { id: parseInt(params.id) } });
    if (!comprador) return NextResponse.json({ message: "Comprador no encontrado" }, { status: 404 });

    const respuesta = {
        id: comprador.id,
        dni: comprador.dni,
        cuil_cuit: comprador.cuilCuit, // Mapeo del campo cuilCuit a cuil_cuit
        apellido: comprador.apellido,
        nombre: comprador.nombre,
        direccion: comprador.direccion,
        mail: comprador.mail,
        celular: comprador.celular,
        condicion_iva: comprador.condicionIva
    };

    return NextResponse.json(respuesta);
}