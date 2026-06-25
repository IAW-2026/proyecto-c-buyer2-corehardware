import { getShippingHeaders } from '@/lib/apiHelpers'

export interface Shipment {
  id: string
  pedido_id: string
  fecha_de_entrega: string
  estado: string
  monto: number
  direccion: string
}

// ─────────────────────────────────────────────
// SERVER-SIDE: llamada directa a la Shipping App
// Solo usar desde Server Components o Route Handlers
// ─────────────────────────────────────────────

export async function fetchShipmentById(id: string): Promise<Shipment | null> {
  const shippingUrl = process.env.SHIPPING_API_URL
  if (!shippingUrl) throw new Error('SHIPPING_API_URL no configurada')

  const res = await fetch(`${shippingUrl}/api/shipment/${id}`, {
    headers: getShippingHeaders(),
    cache: 'no-store',
  })

  if (!res.ok) return null
  return res.json()
}

// ─────────────────────────────────────────────
// CLIENT-SIDE: proxy interno
// Solo usar desde Client Components
// ─────────────────────────────────────────────

export const ShipmentService = {
  async getShipmentById(id: string): Promise<Shipment | null> {
    const response = await fetch(`/api/shipping/shipment/${id}`)
    if (response.status === 404) return null
    if (!response.ok) throw new Error(`Error al obtener envío ${id}: ${response.status}`)
    return response.json()
  },
}