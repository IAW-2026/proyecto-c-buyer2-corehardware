import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateApiKey } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const keyRecibida = req.headers.get('x-api-key');
    const keyEsperada = process.env.BUYER_API_KEY;

    console.log('--- DEBUG DE AUTH ---');
    console.log('Header x-api-key recibido:', `"${keyRecibida}"`);
    console.log('Variable de entorno API_KEY:', `"${keyEsperada}"`);
    console.log('¿Son iguales?', keyRecibida === keyEsperada);
    console.log('---------------------');

    if (!validateApiKey(req)) {
        return NextResponse.json({ 
            error: "No autorizado",
            debug: { 
                recibido: keyRecibida,
                mensaje: "La clave no coincide con lo esperado en el servidor" 
            }
        }, { status: 401 });
    }

    const comprador = await prisma.comprador.findUnique({ where: { id: parseInt(id) } });
    if (!comprador) return NextResponse.json({ message: "Comprador no encontrado" }, { status: 404 });

    const respuesta = {
        id: comprador.id,
        dni: comprador.dni,
        cuil_cuit: comprador.cuilCuit,
        apellido: comprador.apellido,
        nombre: comprador.nombre,
        direccion: comprador.direccion,
        mail: comprador.mail,
        celular: comprador.celular,
        condicion_iva: comprador.condicionIva
    };

    return NextResponse.json(respuesta);
}