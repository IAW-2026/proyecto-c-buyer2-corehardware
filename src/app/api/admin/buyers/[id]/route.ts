// src/app/api/compradores/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/auth";

const updateBuyerSchema = z
    .object({
        apellido: z.string().min(1).optional(),
        nombre: z.string().min(1).optional(),
        sexo: z.string().nullable().optional(),
        direccion: z.string().min(1).optional(),
        mail: z.string().email().optional(),
        celular: z.string().min(6).optional(),
        fechaNacimiento: z.coerce.date().optional(),
        nacionalidad: z.string().min(1).optional(),
        condicionIva: z.string().min(1).optional(),
        perfilCompleto: z.boolean().optional(),
        isDeleted: z.boolean().optional(),
    })
    .strict();

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!validateApiKey(req)) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = updateBuyerSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.flatten().fieldErrors },
            { status: 400 }
        );
    }

    try {
        const comprador = await prisma.comprador.update({
            where: { id },
            data: parsed.data,
        });
        return NextResponse.json(comprador);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return NextResponse.json(
                    { message: "Comprador no encontrado" },
                    { status: 404 }
                );
            }
            if (error.code === "P2002") {
                return NextResponse.json(
                    { message: "El mail ya está en uso por otro comprador" },
                    { status: 409 }
                );
            }
        }
        throw error;
    }
}