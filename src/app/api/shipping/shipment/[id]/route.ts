/**
 * Mock interno — GET /api/shipping/shipment/[id]
 * Simula los datos de un envío de la Shipping App de Matias.
 *
 * Contrato (03-apis.md):
 *   Response 200: { id, pedido_id, fecha_de_entrega, estado, monto, direccion }
 *   Response 404: { message }
 */

import { NextRequest, NextResponse } from 'next/server'
import { MOCK_SHIPMENTS } from '@/data/mockShipments'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const envio = MOCK_SHIPMENTS.find(s => s.id === parseInt(id))

  if (!envio) {
    return NextResponse.json({ message: 'Envío no encontrado' }, { status: 404 })
  }

  return NextResponse.json(envio)
}