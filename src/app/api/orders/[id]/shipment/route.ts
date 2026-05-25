import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateApiKey } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!validateApiKey(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  
  const body = await req.json(); // { "shimpentID": number }
  
  try {
    await prisma.pedido.update({
      where: { id: parseInt(params.id) },
      data: { envioId: body.shimpentID }
    });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return NextResponse.json({ message: "Error al actualizar envío" }, { status: 409 });
  }
}