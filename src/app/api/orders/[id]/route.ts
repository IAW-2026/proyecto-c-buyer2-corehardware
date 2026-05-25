import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateApiKey } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    if (!validateApiKey(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const pedido = await prisma.pedido.findUnique({ where: { id: parseInt(params.id) } });
    if (!pedido) return NextResponse.json({ message: "Pedido no encontrado" }, { status: 404 });

    // Mapeo necesario para cumplir el contrato
    const respuesta = {
        id: pedido.id,
        fecha: pedido.fecha,
        comprador_id: pedido.compradorId, // Ajuste de camel a snake
        vendedor_id: pedido.vendedorId,   // Ajuste de camel a snake
        productos: pedido.productosId,    // Mapeo
        monto: pedido.monto,
        estado: pedido.estado,
        envio_id: pedido.envioId          // Ajuste de camel a snake
    };

    return NextResponse.json(respuesta); 
}