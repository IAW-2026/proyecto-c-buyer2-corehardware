/**
 * GET /api/shipping/shipment/[id]
 *
 * Contrato (03-apis.md):
 *   Response 200: { id, pedido_id, fecha_de_entrega, estado, monto, direccion }
 *   Response 404: { message }
 */
import { NextRequest, NextResponse } from 'next/server'
import { getShippingHeaders, isMockMode } from '@/lib/apiHelpers'
import { MOCK_SHIPMENTS } from '@/data/mockShipments'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (isMockMode()) {
    const shipment = MOCK_SHIPMENTS.find((s) => String(s.id) === id)
    if (!shipment) return NextResponse.json({ message: 'Envío no encontrado' }, { status: 404 })
    return NextResponse.json({
      ...shipment,
      id: String(shipment.id),
      pedido_id: String(shipment.pedido_id),
    })
  }

  const shippingUrl = process.env.SHIPPING_API_URL
  if (!shippingUrl) {
    return NextResponse.json({ message: 'Shipping API no configurada' }, { status: 500 })
  }

  const response = await fetch(`${shippingUrl}/shipment/${id}`, {
    method: 'GET',
    headers: getShippingHeaders(),
  })

  if (response.status === 404) return NextResponse.json({ message: 'Envío no encontrado' }, { status: 404 })
  if (!response.ok) return NextResponse.json({ message: 'Error en Shipping App' }, { status: response.status })

  return NextResponse.json(await response.json())
}