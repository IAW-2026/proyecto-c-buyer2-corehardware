import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateApiKey } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    if (!validateApiKey(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const pedido = await prisma.pedido.findUnique({ where: { id: parseInt(id) } });
    if (!pedido) return NextResponse.json({ message: "Pedido no encontrado" }, { status: 404 });

    const respuesta = {
        id: pedido.id,
        fecha: pedido.fecha,
        comprador_id: pedido.compradorId,
        vendedor_id: pedido.vendedorId,
        productos: pedido.productosId,
        monto: pedido.monto,
        estado: pedido.estado,
        envio_id: pedido.envioId
    };

    return NextResponse.json(respuesta); 
}