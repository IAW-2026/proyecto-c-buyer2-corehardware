import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    if (!validateApiKey(req)) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    if (!id || id.trim() === '') {
        return NextResponse.json({ message: 'ID de comprador inválido' }, { status: 400 })
    }

    const comprador = await prisma.comprador.findUnique({ where: { id } })
    if (!comprador) {
        return NextResponse.json({ message: 'Comprador no encontrado' }, { status: 404 })
    }

    return NextResponse.json({
        id: comprador.id,
        dni: comprador.dni,
        cuil_cuit: comprador.cuilCuit,
        apellido: comprador.apellido,
        nombre: comprador.nombre,
        direccion: comprador.direccion,
        mail: comprador.mail,
        celular: comprador.celular,
        condicion_iva: comprador.condicionIva,
        id_clerk: comprador.clerkUserId,
    })
}

const CAMPOS_EDITABLES: Record<string, string> = {
    nombre: 'nombre',
    apellido: 'apellido',
    sexo: 'sexo',
    direccion: 'direccion',
    mail: 'mail',
    celular: 'celular',
    condicion_iva: 'condicionIva',
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    if (!validateApiKey(req)) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    if (!id || id.trim() === '') {
        return NextResponse.json({ message: 'ID de comprador inválido' }, { status: 400 })
    }

    const comprador = await prisma.comprador.findUnique({ where: { id } })
    if (!comprador) {
        return NextResponse.json({ message: 'Comprador no encontrado' }, { status: 404 })
    }

    const body = await req.json()

    const camposInvalidos = Object.keys(body).filter((key) => !(key in CAMPOS_EDITABLES))
    if (camposInvalidos.length > 0) {
        return NextResponse.json(
            { message: `Campos no permitidos: ${camposInvalidos.join(', ')}` },
            { status: 400 },
        )
    }

    const data: Record<string, string> = {}
    for (const [campoApi, campoPrisma] of Object.entries(CAMPOS_EDITABLES)) {
        if (campoApi in body) {
            data[campoPrisma] = body[campoApi]
        }
    }

    const actualizado = await prisma.comprador.update({
        where: { id },
        data,
    })

    return NextResponse.json({
        id: actualizado.id,
        dni: actualizado.dni,
        cuil_cuit: actualizado.cuilCuit,
        apellido: actualizado.apellido,
        nombre: actualizado.nombre,
        direccion: actualizado.direccion,
        mail: actualizado.mail,
        celular: actualizado.celular,
        condicion_iva: actualizado.condicionIva,
        id_clerk: actualizado.clerkUserId,
    })
}