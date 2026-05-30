/**
 * API interna de pagos — /api/payments/checkout
 *
 * En Etapa 2: devuelve datos mockeados y crea el Pedido en la BD.
 * En Etapa 3: paymentService.ts apuntará directamente a la app de Agustín,
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

interface CheckoutBody {
  fecha: string
  vendedorId: number
  productos: number[]
  monto: number
}

export async function POST(req: NextRequest) {
  // 1. Verificar autenticación
  console.log('🟢 checkout route hit')
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
  }

  // 2. Parsear y validar body
  let body: CheckoutBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'Body inválido' }, { status: 400 })
  }

  const { fecha, vendedorId, productos, monto } = body

  if (!vendedorId || !productos?.length || !monto) {
    return NextResponse.json(
      { message: 'Faltan campos obligatorios: vendedorId, productos, monto' },
      { status: 400 }
    )
  }

  // 3. Buscar el comprador por clerkUserId — el servidor deduce el compradorId del JWT
  const comprador = await prisma.comprador.findUnique({
    where: { clerkUserId: userId },
  })

  console.log('comprador:', comprador)

  if (!comprador || comprador.isDeleted) {
    return NextResponse.json({ message: 'Comprador no encontrado' }, { status: 404 })
  }

  //TODO
  // if (comprador.clerkUserId !== userId) {
  //   return NextResponse.json(
  //     { message: 'No podés hacer checkout en nombre de otro comprador' },
  //     { status: 403 }
  //   )
  // }

  // 4. Crear el Pedido en la BD con estado PENDIENTE_PAGO
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

  // 5. Vaciar el carrito del comprador (si tiene uno)
  const carrito = await prisma.carrito.findUnique({
    where: { compradorId: comprador.id },
  })
  if (carrito) {
    await prisma.carritoItem.deleteMany({ where: { carritoId: carrito.id } })
  }

  // 6. Respuesta mockeada con el formato que devolvería Payments App
  //    (formato acordado en 03-apis.md)
  const mockPagoResponse = {
    id: Math.floor(Math.random() * 100000),
    forma_de_pago: null,                          // MercadoPago lo completa después
    estado: 'pending',                            // Estado inicial de MercadoPago
    pedido_id: nuevoPedido.id,
    fecha: nuevoPedido.fecha.toISOString(),
    descripcion: `Pago pedido #${nuevoPedido.id} — CoreHardware`,
    monto: nuevoPedido.monto,
    // En Etapa 3, se usara la URL real de MercadoPago:
    init_point: 'https://sandbox.mercadopago.com.ar/checkout/mock',
  }

  return NextResponse.json(mockPagoResponse, { status: 201 })
}
