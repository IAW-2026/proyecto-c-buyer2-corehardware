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

  const vendedorNombre = resultados.find((p) => p !== null)?.vendedor ?? null

  let pedido: Pedido = {
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

  // Opción B — sincronización en tiempo de lectura
  if (envio && envio.estado !== pedido.estado) {
    try {
      await prisma.pedido.update({
        where: { id: pedido.id },
        data:  { estado: envio.estado },
      })
      pedido = { ...pedido, estado: envio.estado as Pedido['estado'] }
      console.log(`[Sync] Pedido ${pedido.id} actualizado a estado: ${envio.estado}`)
    } catch (err) {
      console.error('[Sync] No se pudo sincronizar estado del pedido:', err)
    }
  }

  return <PedidoDetallePage pedido={pedido} productos={productos} envio={envio} />
}