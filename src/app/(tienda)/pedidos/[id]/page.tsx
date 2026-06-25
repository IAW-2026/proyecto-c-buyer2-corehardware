import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { agruparProductos } from '@/utils/pedidoUtils'
import { Pedido, ProductoConCantidad } from '@/types/pedido'
import PedidoDetallePage from './PedidoDetallePage'

async function fetchProductById(id: string, requestHeaders: Headers) {
  const host = requestHeaders.get('host') ?? 'localhost:3000'
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const res = await fetch(`${protocol}://${host}/api/seller/products/${id}`, {
    cache: 'no-store',
  })
  if (!res.ok) return null
  return res.json()
}

async function fetchShipmentById(id: string, requestHeaders: Headers) {
  const host = requestHeaders.get('host') ?? 'localhost:3000'
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const res = await fetch(`${protocol}://${host}/api/shipping/shipment/${id}`, {
    cache: 'no-store',
  })
  if (!res.ok) return null
  return res.json()
}

async function fetchSellerById(id: string, requestHeaders: Headers) {
  const host = requestHeaders.get('host') ?? 'localhost:3000'
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const res = await fetch(`${protocol}://${host}/api/seller/sellers/${id}`, {
    cache: 'no-store',
  })
  if (!res.ok) return null
  return res.json()
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { userId } = await auth()
  if (!userId) redirect(`/sign-in?redirectUrl=/pedidos/${id}`)

  const requestHeaders = await headers()

  const comprador = await prisma.comprador.findUnique({ where: { clerkUserId: userId } })
  if (!comprador) notFound()

  const pedidoDB = await prisma.pedido.findUnique({ where: { id } })
  if (!pedidoDB) notFound()
  if (pedidoDB.compradorId !== comprador.id) notFound()

  // Obtener nombre del vendedor
  const vendedor = await fetchSellerById(pedidoDB.vendedorId, requestHeaders)

  const pedido: Pedido = {
    id:              pedidoDB.id,
    fecha:           pedidoDB.fecha.toISOString(),
    comprador_id:    pedidoDB.compradorId,
    vendedor_id:     pedidoDB.vendedorId,
    vendedor_nombre: vendedor?.razon_social ?? null,
    productos:       pedidoDB.productosId,
    monto:           pedidoDB.monto,
    estado:          pedidoDB.estado as Pedido['estado'],
    envio_id:        pedidoDB.envioId ?? null,
  }

  const agrupados = agruparProductos(pedido.productos)
  const idsUnicos = [...new Set(pedido.productos)]
  const resultados = await Promise.all(
    idsUnicos.map((pid) => fetchProductById(pid, requestHeaders))
  )
  const productos: ProductoConCantidad[] = resultados
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .map((p) => ({
      ...p,
      cantidad: agrupados.find((a) => a.id === p.id)?.cantidad ?? 1,
    }))

  const envio = pedido.envio_id
    ? await fetchShipmentById(pedido.envio_id, requestHeaders)
    : null

  return <PedidoDetallePage pedido={pedido} productos={productos} envio={envio} />
}