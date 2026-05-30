
export type EstadoPedido =
  | 'PENDIENTE_PAGO'
  | 'PAGO_APROBADO'
  | 'PAGO_RECHAZADO'
  | 'EN_PREPARACION'
  | 'EN_CAMINO'
  | 'ENTREGADO'
  | 'CANCELADO'

export interface Pedido {
  id: number
  fecha: string           // ISO string desde la API
  comprador_id: number
  vendedor_id: number
  productos: number[]     // IDs de productos
  monto: number
  estado: EstadoPedido
  envio_id: number | null
}

export interface PedidosResponse {
  items: Pedido[]
  total: number
  limit: number
  offset: number
}