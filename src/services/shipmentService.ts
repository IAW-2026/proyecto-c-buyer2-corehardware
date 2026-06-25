/**
 * shipmentService.ts — Servicio para consumir la Shipping App
 *
 * ARQUITECTURA:
 *   Browser → shipmentService → /api/shipping/... (proxy interno)
 *   El proxy interno llama a la Shipping App real con la API key,
 *   que vive solo en el servidor y nunca se expone al browser.
 */

// ─────────────────────────────────────────────
// Tipos — según contrato 03-apis.md
// ─────────────────────────────────────────────
export interface Shipment {
  id: string
  pedido_id: string
  fecha_de_entrega: string
  estado: string
  monto: number
  direccion: string
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
  async getShipmentById(id: string): Promise<Shipment | null> {
    const response = await fetch(`/api/shipping/shipment/${id}`, {
      method: 'GET',
    })

    if (response.status === 404) return null
    if (!response.ok) throw new Error(`Error al obtener envío ${id}: ${response.status}`)

    return response.json()
  },
}