/**
 * /api/payments/checkout
 * En Etapa 3: paymentService.ts apuntará directamente a la app de pago
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
  vendedorId: z.string().min(1, 'vendedorId es requerido'),
  productos: z.array(
    z.string().min(1, 'cada producto debe ser un ID válido')
  ).min(1, 'Debe haber al menos un producto'),
  monto: z.number()
    .positive('el monto debe ser mayor a cero')
    .max(99999999, 'monto fuera de rango'),
  subtotalProductos: z.number()
    .nonnegative('subtotalProductos no puede ser negativo')
    .max(99999999, 'subtotalProductos fuera de rango')
    .optional(),
  costoEnvio: z.number()
    .nonnegative('costoEnvio no puede ser negativo')
    .max(99999999, 'costoEnvio fuera de rango')
    .optional(),
})

export async function POST(req: NextRequest) {
  // 1. Verificar JWT
  const { userId, getToken } = await auth()
  if (!userId) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
  }

  // 2. Verificar Payments URL
  const paymentsUrl = process.env.PAYMENTS_API_URL
  if (!paymentsUrl) {
    return NextResponse.json({ message: 'Error de configuración del servidor' }, { status: 500 })
  }

  // 3. Parsear y validar body
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

  const { fecha, vendedorId, productos, monto, subtotalProductos, costoEnvio } = result.data

  // 4. Buscar comprador por clerkUserId
  const comprador = await prisma.comprador.findUnique({
    where: { clerkUserId: userId },
  })
  if (!comprador || comprador.isDeleted) {
    return NextResponse.json({ message: 'Comprador no encontrado' }, { status: 404 })
  }

  // 5. Crear pedido en nuestra BD
  const nuevoPedido = await prisma.pedido.create({
    data: {
      fecha: fecha ? new Date(fecha) : new Date(),
      compradorId: comprador.id,
      vendedorId,
      productosId: productos,
      monto,
      subtotalProductos: subtotalProductos ?? null,
      costoEnvio: costoEnvio ?? null,
      estado: 'PENDIENTE_PAGO',
      envioId: null,
    },
  })

  // 6. Vaciar carrito
  const carrito = await prisma.carrito.findUnique({
    where: { compradorId: comprador.id },
  })
  if (carrito) {
    await prisma.carritoItem.deleteMany({ where: { carritoId: carrito.id } })
  }

  // 7. Llamar a Payments App con JWT del usuario
  // Contrato 03-apis.md: no cambia. subtotalProductos/costoEnvio son
  // internos de Buyer, no forman parte del contrato con Payments.
  const token = await getToken()
  const paymentsPayload = {
    id: nuevoPedido.id,
    fecha: nuevoPedido.fecha.toISOString(),
    comprador_id: comprador.id,
    vendedor_id: vendedorId,
    productos,
    monto,
  }

  const paymentsResponse = await fetch(`${paymentsUrl}/api/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(paymentsPayload),
  })

  const paymentsText = await paymentsResponse.text()
 
  // 8. Si Payments falla, cancelamos el pedido
  if (!paymentsResponse.ok) {
    await prisma.pedido.update({
      where: { id: nuevoPedido.id },
      data: { estado: 'CANCELADO' },
    })
    return NextResponse.json(
      { message: 'Error al procesar el pago' },
      { status: paymentsResponse.status }
    )
  }

  const paymentsData = JSON.parse(paymentsText)
  return NextResponse.json(paymentsData, { status: 201 })
}