import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { agruparProductos } from '@/utils/pedidoUtils'
import { Pedido, ProductoConCantidad } from '@/types/pedido'
import PedidoDetallePage from './PedidoDetallePage'
import { fetchSellerProductById } from '@/services/sellerService'
import { fetchShipmentById } from '@/services/shipmentService'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { userId } = await auth()
  if (!userId) redirect(`/sign-in?redirectUrl=/pedidos/${id}`)

  const comprador = await prisma.comprador.findUnique({ where: { clerkUserId: userId } })
  if (!comprador) notFound()

  const pedidoDB = await prisma.pedido.findUnique({ where: { id } })
  if (!pedidoDB) notFound()
  if (pedidoDB.compradorId !== comprador.id) notFound()

  const agrupados = agruparProductos(pedidoDB.productosId)
  const idsUnicos = [...new Set(pedidoDB.productosId)]
  const resultados = await Promise.all(
    idsUnicos.map((pid) => fetchSellerProductById(pid))
  )

  // El nombre del vendedor viene en cada producto — evitamos un fetch extra a /api/sellers/:id
  const vendedorNombre = resultados.find((p) => p !== null)?.vendedor ?? null

  const pedido: Pedido = {
    id:              pedidoDB.id,
    fecha:           pedidoDB.fecha.toISOString(),
    comprador_id:    pedidoDB.compradorId,
    vendedor_id:     pedidoDB.vendedorId,
    vendedor_nombre: vendedorNombre,
    productos:       pedidoDB.productosId,
    monto:           pedidoDB.monto,
    estado:          pedidoDB.estado as Pedido['estado'],
    envio_id:        pedidoDB.envioId ?? null,
  }

  const productos: ProductoConCantidad[] = resultados
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .map((p) => ({
      ...p,
      cantidad: agrupados.find((a) => a.id === p.id)?.cantidad ?? 1,
    }))

  const envio = pedido.envio_id
    ? await fetchShipmentById(pedido.envio_id)
    : null

  console.log('[PedidoDetalle] envio_id:', pedidoDB.envioId, '| envio:', JSON.stringify(envio))
  return <PedidoDetallePage pedido={pedido} productos={productos} envio={envio} />
}