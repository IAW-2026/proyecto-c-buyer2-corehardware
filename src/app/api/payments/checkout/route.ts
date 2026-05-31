/**
 * API interna de pagos — /api/payments/checkout
 *
 * En Etapa 2: devuelve datos mockeados y crea el Pedido en la BD.
 * En Etapa 3: paymentService.ts apuntará directamente a la app de pagos,
 *             este endpoint quedará como fallback o se eliminará.
 *
 * Contrato acordado en 03-apis.md:
 *   POST /api/checkout
 *   Body: { id, fecha, compradorId, vendedorId, productos: number[], monto }
 *   Response 201: { id, forma_de_pago, estado, pedido_id, fecha, descripcion, monto }
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const checkoutSchema = z.object({
  fecha: z.string().optional(),
  vendedorId: z.number().min(1, 'vendedorId es requerido y debe ser positivo')
    .int('vendedorId debe ser entero')
    .positive('vendedorId debe ser positivo'),

  productos: z.array(
    z.number().int().positive('cada producto debe ser un ID positivo')
  ).min(1, 'Debe haber al menos un producto'),
  monto: z.number().min(0.01, 'monto es requerido y debe ser positivo')
    .positive('el monto debe ser mayor a cero')
    .max(99999999, 'monto fuera de rango'),
})

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'Body inválido' }, { status: 400 })
  }

  const result = checkoutSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { message: 'Datos inválidos', detalles: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { fecha, vendedorId, productos, monto } = result.data
  //Buscar el comprador por clerkUserId — el servidor deduce el compradorId del JWT
  const comprador = await prisma.comprador.findUnique({
    where: { clerkUserId: userId },
  })

  if (!comprador || comprador.isDeleted) {
    return NextResponse.json({ message: 'Comprador no encontrado' }, { status: 404 })
  }

  const nuevoPedido = await prisma.pedido.create({
    data: {
      fecha: fecha ? new Date(fecha) : new Date(),
      compradorId: comprador.id,
      vendedorId,
      productosId: productos,
      monto,
      estado: 'PENDIENTE_PAGO',
      envioId: null,
    },
  })

  //Vaciar el carrito del comprador (si tiene uno)
  const carrito = await prisma.carrito.findUnique({
    where: { compradorId: comprador.id },
  })
  if (carrito) {
    await prisma.carritoItem.deleteMany({ where: { carritoId: carrito.id } })
  }

  return NextResponse.json({
    id: Math.floor(Math.random() * 100000),
    forma_de_pago: null,                           // MercadoPago lo completa después
    estado: 'pending',                             // Estado inicial de MercadoPago
    pedido_id: nuevoPedido.id,
    fecha: nuevoPedido.fecha.toISOString(),
    descripcion: `Pago pedido #${nuevoPedido.id} — CoreHardware`,
    monto: nuevoPedido.monto,
    // En Etapa 3, se usara la URL real de MercadoPago:
    init_point: 'https://sandbox.mercadopago.com.ar/checkout/mock',
  }, { status: 201 })
}