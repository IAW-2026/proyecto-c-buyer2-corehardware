/**
 * shipmentService.ts — Servicio para consumir la Shipping App
 *
 * ARQUITECTURA:
 *   Frontend → shipmentService → /api/shipping/... (mock interno, Etapa 2)
 *                             → SHIPPING_API_URL/... (app de Matias, Etapa 3)
 *
 * Para pasar a Etapa 3: definir NEXT_PUBLIC_SHIPPING_API_URL en .env.local
 */

// ─────────────────────────────────────────────
// Tipos — según contrato 03-apis.md
// ─────────────────────────────────────────────
export interface Shipment {
  id: number
  pedido_id: number
  fecha_de_entrega: string
  estado: string
  monto: number
  direccion: string
}

// ─────────────────────────────────────────────
// Helper de routing
// ─────────────────────────────────────────────
function getShippingBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SHIPPING_API_URL ?? '/api/shipping'
}

function getHeaders(): HeadersInit {
  const apiKey = process.env.NEXT_PUBLIC_SHIPPING_API_KEY
  return {
    'Content-Type': 'application/json',
    ...(apiKey ? { 'X-API-Key': apiKey } : {}),
  }
}

// ─────────────────────────────────────────────
// Servicio
// ─────────────────────────────────────────────
export const ShipmentService = {

  /**
   * GET /shipment/:id — datos de un envío
   * Usado en la página de seguimiento_envio
   *
   * Contrato (03-apis.md):
   *   Response 200: { id, pedido_id, fecha_de_entrega, estado, monto, direccion }
   *   Response 404: { message }
   */
  async getShipmentById(id: number): Promise<Shipment | null> {
    const base = getShippingBaseUrl()

    const response = await fetch(`${base}/shipment/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    })

    if (response.status === 404) return null
    if (!response.ok) throw new Error(`Error al obtener envío ${id}: ${response.status}`)

    return response.json()
  },
}
