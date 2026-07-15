/**
 *  GET /api/seller/sellers/[id]
 *
 * Contrato (03-apis.md):
 *   Response 200: { id, cuit, razon_social, direccion, mail, celular, condicion_iva }
 *   Response 404: { message }
 */
import { NextRequest, NextResponse } from 'next/server'
import { getSellerHeaders } from '@/lib/apiHelpers'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const sellerUrl = process.env.SELLER_API_URL
  if (!sellerUrl) {
    return NextResponse.json({ message: 'Seller API no configurada' }, { status: 500 })
  }

  const response = await fetch(`${sellerUrl}/api/sellers/${id}`, {
    method: 'GET',
    headers: getSellerHeaders(),
  })

  if (response.status === 404) return NextResponse.json({ message: 'Vendedor no encontrado' }, { status: 404 })
  if (!response.ok) return NextResponse.json({ message: 'Error en Seller App' }, { status: response.status })

  return NextResponse.json(await response.json())
}