/**
 * Mock interno — GET /api/seller/sellers/[id]
 * Simula los datos de un vendedor de la Seller App.
 *
 * Contrato (03-apis.md):
 *   Response 200: { id, cuit, razon_social, direccion, mail, celular, condicion_iva }
 *   Response 404: { message }
 */

import { NextRequest, NextResponse } from 'next/server'
import { MOCK_SELLERS } from '@/data/mockSellers'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const vendedor = MOCK_SELLERS.find(s => s.id === parseInt(id))

  if (!vendedor) {
    return NextResponse.json({ message: 'Vendedor no encontrado' }, { status: 404 })
  }

  return NextResponse.json(vendedor)
}