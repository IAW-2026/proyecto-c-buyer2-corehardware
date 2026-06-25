/**
 * paymentService.ts — Servicio de pagos del lado del cliente
 *
 * ARQUITECTURA:
 *   Browser → paymentService → /api/payments/checkout (proxy interno)
 *   El proxy interno llama a la Payments App real con el JWT del usuario.
 */

// ─────────────────────────────────────────────
// Estados del Pedido (acordados con el equipo)
// ─────────────────────────────────────────────
export const ESTADOS_PEDIDO = {
  PENDIENTE_PAGO: 'PENDIENTE_PAGO',
  PAGO_APROBADO: 'PAGO_APROBADO',
  PAGO_RECHAZADO: 'PAGO_RECHAZADO',
  EN_PREPARACION: 'EN_PREPARACION',
  EN_CAMINO: 'EN_CAMINO',
  ENTREGADO: 'ENTREGADO',
  CANCELADO: 'CANCELADO',
} as const

export type EstadoPedido = typeof ESTADOS_PEDIDO[keyof typeof ESTADOS_PEDIDO]

// ─────────────────────────────────────────────
// Estados que llegan de MercadoPago (vía Payments App)
// ─────────────────────────────────────────────
export const ESTADOS_MERCADOPAGO = {
  approved: 'approved',     // → nosotros: PAGO_APROBADO
  rejected: 'rejected',     // → nosotros: PAGO_RECHAZADO
  pending: 'pending',       // → nosotros: PENDIENTE_PAGO
  in_process: 'in_process', // → nosotros: PENDIENTE_PAGO
  cancelled: 'cancelled',   // → nosotros: CANCELADO
  refunded: 'refunded',     // → nosotros: CANCELADO
} as const

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────
export interface CheckoutPayload {
  fecha: string
  vendedorId: string
  productos: string[]
  monto: number
}

export interface CheckoutResponse {
  id: string
  forma_de_pago: string | null
  estado: string
  pedido_id: string
  fecha: string
  descripcion: string
  monto: number
  init_point?: string
}

// ─────────────────────────────────────────────
// Servicio principal
// ─────────────────────────────────────────────
export const PaymentService = {

  /**
   * Inicia el proceso de checkout.
   * Siempre llama al proxy interno /api/payments/checkout,
   * que se encarga de llamar a la Payments App real.
   *
   * @param payload  Datos del pedido según contrato 03-apis.md
   * @param token    JWT de Clerk del comprador autenticado
   */
  async iniciarCheckout(
    payload: CheckoutPayload,
    token: string
  ): Promise<CheckoutResponse> {
    const response = await fetch('/api/payments/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    if (response.status === 201) return response.json()

    if (response.status === 400) {
      const error = await response.json().catch(() => ({ message: 'Datos inválidos' }))
      throw new Error(`Error 400: ${error.message}`)
    }
    if (response.status === 401) throw new Error('No autorizado. Verificá tu sesión.')
    if (response.status === 403) throw new Error('No tenés permiso para realizar esta operación.')
    if (response.status === 404) throw new Error('No se encontró tu perfil. Completá tu registro antes de comprar.')
    if (response.status === 405) {
      const error = await response.json().catch(() => ({ message: 'Método no permitido' }))
      throw new Error(`Error 405: ${error.message}`)
    }

    throw new Error(`Error inesperado del servidor: ${response.status}`)
  },

  /**
   * Actualiza el estado de un pedido.
   * En Etapa 3: Payments notifica directamente vía webhook,
   * este método queda como fallback manual.
   */
  async actualizarEstadoPedido(
    pedidoId: string,
    nuevoEstado: EstadoPedido,
    token: string
  ): Promise<void> {
    const response = await fetch(`/api/orders/${pedidoId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ estado: nuevoEstado }),
    })

    if (!response.ok) {
      throw new Error(`No se pudo actualizar el estado del pedido: ${response.status}`)
    }
  },
}