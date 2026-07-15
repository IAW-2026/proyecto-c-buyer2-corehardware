export type EstadoPedido =
  | 'PENDIENTE_PAGO'
  | 'PAGO_APROBADO'
  | 'PAGO_RECHAZADO'
  | 'EN_PREPARACION'
  | 'EN_CAMINO'
  | 'ENTREGADO'
  | 'CANCELADO'

export interface Pedido {
  id: string
  fecha: string
  comprador_id: string
  vendedor_id: string
  vendedor_nombre: string | null  // null solo si el fetch a Seller falla
  productos: string[]
  monto: number
  estado: EstadoPedido
  envio_id: string | null
}

export interface PedidosResponse {
  items: Pedido[]
  total: number
  limit: number
  offset: number
}

import { ProductSummary } from '@/types/producto'

export interface ProductoConCantidad extends ProductSummary {
  cantidad: number
}