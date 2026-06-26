/**
 *  GET /api/seller/products/[id]
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSellerHeaders, isMockMode } from '@/lib/apiHelpers'
import { MOCK_PRODUCTS_DETAIL } from '@/data/mockProducts'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (isMockMode()) {
    const product = MOCK_PRODUCTS_DETAIL.find((p) => String(p.id) === id)
    if (!product) return NextResponse.json({ message: 'Producto no encontrado' }, { status: 404 })
    return NextResponse.json({ ...product, id: String(product.id), vendedorId: String(product.vendedorId) })
  }

  const sellerUrl = process.env.SELLER_API_URL
  if (!sellerUrl) {
    return NextResponse.json({ message: 'Seller API no configurada' }, { status: 500 })
  }

  const response = await fetch(`${sellerUrl}/api/products/${id}`, {
    method: 'GET',
    headers: getSellerHeaders(),
  })

  if (response.status === 404) return NextResponse.json({ message: 'Producto no encontrado' }, { status: 404 })
  if (!response.ok) return NextResponse.json({ message: 'Error en Seller App' }, { status: response.status })

  return NextResponse.json(await response.json())
}