import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Pedido } from '@/types/pedido'
import { fetchSellerById } from '@/services/sellerService'
import { fetchShipmentById } from '@/services/shipmentService'
import { SeguimientoContent } from './SeguimientoContent'

interface PageProps {
  searchParams: Promise<{ pedidoId?: string; envioId?: string }>
}

export default async function SeguimientoEnvioPage({ searchParams }: PageProps) {
  const { userId } = await auth()
  const { pedidoId, envioId } = await searchParams

  if (!userId) {
    redirect(`/sign-in?redirectUrl=/seguimiento_envio?pedidoId=${pedidoId}&envioId=${envioId}`)
  }

  let envio = null
  if (envioId) {
    try {
      envio = await fetchShipmentById(envioId)
    } catch (err) {
      console.error('[SeguimientoEnvio] fetchShipmentById falló:', err)
    }
  }

  let pedido: Pedido | null = null
  if (pedidoId) {
    try {
      const comprador = await prisma.comprador.findUnique({ where: { clerkUserId: userId } })
      if (comprador) {
        const pedidoDB = await prisma.pedido.findUnique({ where: { id: pedidoId } })
        if (pedidoDB && pedidoDB.compradorId === comprador.id) {
          let vendedorNombre: string | null = null
          try {
            const vendedor = await fetchSellerById(pedidoDB.vendedorId)
            vendedorNombre = vendedor?.razon_social ?? null
          } catch (err) {
            console.error('[SeguimientoEnvio] fetchSellerById falló:', err)
          }
          pedido = {
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
        }
      }
    } catch (err) {
      console.error('[SeguimientoEnvio] prisma falló:', err)
    }
  }

  return (
    <SeguimientoContent
      envio={envio}
      pedido={pedido}
      pedidoId={pedidoId}
      envioId={envioId}
    />
  )
}