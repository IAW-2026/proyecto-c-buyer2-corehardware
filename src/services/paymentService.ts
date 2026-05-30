/**
 * paymentService.ts — Servicio de pagos del lado del cliente
 *
 * ARQUITECTURA:
 *   Browser → paymentService → /api/payments/checkout (API interna, Etapa 2)
 *                           → PAYMENTS_API_URL/checkout (App de Agustín, Etapa 3)
 *
 * Para pasar a Etapa 3: definir NEXT_PUBLIC_PAYMENTS_API_URL en .env.local
 * apuntando a la URL de la Payments App. Sin esa variable, usa la API interna.
 */

// ─────────────────────────────────────────────
// Estados del Pedido (acordados con el equipo)
// ─────────────────────────────────────────────
export const ESTADOS_PEDIDO = {
  PENDIENTE_PAGO: 'PENDIENTE_PAGO',   // Pedido creado, esperando confirmación de pago
  PAGO_APROBADO: 'PAGO_APROBADO',    // MercadoPago confirmó el pago
  PAGO_RECHAZADO: 'PAGO_RECHAZADO',   // MercadoPago rechazó el pago
  EN_PREPARACION: 'EN_PREPARACION',   // Seller confirmó y está preparando el envío
  EN_CAMINO: 'EN_CAMINO',        // Shipping tomó el pedido
  ENTREGADO: 'ENTREGADO',        // Shipping marcó como entregado
  CANCELADO: 'CANCELADO',        // Cancelado por disputa o acción manual
} as const

export type EstadoPedido = typeof ESTADOS_PEDIDO[keyof typeof ESTADOS_PEDIDO]

// ─────────────────────────────────────────────
// Estados que llegan de MercadoPago (vía Payments App)
// Se los traduce a nuestros estados internos
// ─────────────────────────────────────────────
export const ESTADOS_MERCADOPAGO = {
  approved: 'approved',     // → nosotros: PAGO_APROBADO
  rejected: 'rejected',     // → nosotros: PAGO_RECHAZADO
  pending: 'pending',      // → nosotros: PENDIENTE_PAGO
  in_process: 'in_process',   // → nosotros: PENDIENTE_PAGO
  cancelled: 'cancelled',    // → nosotros: CANCELADO
  refunded: 'refunded',     // → nosotros: CANCELADO
} as const

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────
export interface CheckoutPayload {
  fecha: string
  vendedorId: number
  productos: number[]
  monto: number
}

export interface CheckoutResponse {
  id: number
  forma_de_pago: string | null
  estado: string
  pedido_id: number
  fecha: string
  descripcion: string
  monto: number
  init_point?: string   // URL de MercadoPago para redirigir al usuario (Etapa 3)
}

// ─────────────────────────────────────────────
// Helpers de routing
// ─────────────────────────────────────────────

/**
 * Devuelve la URL del endpoint de checkout.
 * - Si NEXT_PUBLIC_PAYMENTS_API_URL está definida → Etapa 3 (app real de Agustín)
 * - Si no → Etapa 2 (API interna mockeada)
 */
function getCheckoutUrl(): string {
  return process.env.NEXT_PUBLIC_PAYMENTS_API_URL
    ? `${process.env.NEXT_PUBLIC_PAYMENTS_API_URL}/checkout`
    : '/api/payments/checkout'
}
// ─────────────────────────────────────────────
// Servicio principal
// ─────────────────────────────────────────────
export const PaymentService = {

  /**
   * Inicia el proceso de checkout.
   * Crea el pedido en la BD y delega el pago a la Payments App (o mock).
   *
   * @param payload  Datos del pedido según contrato 03-apis.md
   * @param token    JWT de Clerk del comprador autenticado
   */
  async iniciarCheckout(
    payload: CheckoutPayload,
    token: string
  ): Promise<CheckoutResponse> {
    const url = getCheckoutUrl()

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    if (response.status === 201) {
      return response.json()
    }

    if (response.status === 400) {
      const error = await response.json().catch(() => ({ message: 'Datos inválidos' }))
      throw new Error(`Error 400: ${error.message}`)
    }

    if (response.status === 401) {
      throw new Error('No autorizado. Verificá tu sesión.')
    }

    if (response.status === 403) {
      throw new Error('No tenés permiso para realizar esta operación.')
    }

    if (response.status === 404) {
      throw new Error('No se encontró tu perfil. Completá tu registro antes de comprar.')
    }

    if (response.status === 405) {
      const error = await response.json().catch(() => ({ message: 'Método no permitido' }))
      throw new Error(`Error 405: ${error.message}`)
    }

    throw new Error(`Error inesperado del servidor: ${response.status}`)
  },

  /**
   * Actualiza el estado de un pedido (llamado desde webhooks o polling).
   * En Etapa 2: llama a la API interna.
   * En Etapa 3: no necesario, Payments notifica directamente.
   */
  async actualizarEstadoPedido(
    pedidoId: number,
    nuevoEstado: EstadoPedido,
    token: string
  ): Promise<void> {
    const response = await fetch(`/api/orders/${pedidoId}/status`, {
      method: 'PATCH',
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
