/**
 * Mock interno — GET /api/seller/products
 *
 * Simula la respuesta de la Seller App de Sebastián.
 * En Etapa 3 este endpoint queda obsoleto — sellerService.ts
 * apuntará directo a NEXT_PUBLIC_SELLER_API_URL.
 *
 * Soporta los mismos query params que el contrato real:
 *   ?offset=0&limit=10&name=...&brand=...&hasStock=true&seller=...
 */

import { NextRequest, NextResponse } from 'next/server'
import { MOCK_PRODUCTS_SUMMARY } from '@/data/mockProducts'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const offset = parseInt(searchParams.get('offset') ?? '0')
  const limit  = parseInt(searchParams.get('limit')  ?? '10')
  const name     = searchParams.get('name')     ?? ''
  const brand    = searchParams.get('brand')    ?? ''
  const hasStock = searchParams.get('hasStock') === 'true'
  const sellerId = searchParams.get('sellerId') ?? ''
  const seller   = searchParams.get('seller')   ?? ''

  let filtered = [...MOCK_PRODUCTS_SUMMARY]

  if (name)     filtered = filtered.filter(p => p.nombre.toLowerCase().includes(name.toLowerCase()))
  if (brand)    filtered = filtered.filter(p => p.marca.toLowerCase() === brand.toLowerCase())
  if (hasStock) filtered = filtered.filter(p => p.stock > 0) 
  if (sellerId) filtered = filtered.filter(p => p.vendedorId === parseInt(sellerId))
  if (seller)   filtered = filtered.filter(p => p.vendedor.toLowerCase() === seller.toLowerCase())

  if (filtered.length === 0) {
    return new NextResponse(null, { status: 204 })
  }

  const items = filtered.slice(offset, offset + limit)

  return NextResponse.json({
    items,
    total: filtered.length,
  })
}