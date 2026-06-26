/**
 * GET /api/seller/products
 *
 * sellerService.ts apuntará directo a SELLER_API_URL.
 *
 * Soporta los mismos query params que el contrato real:
 *   ?offset=0&limit=10&name=...&brand=...&hasStock=true&seller=...
 */
import { NextRequest, NextResponse } from 'next/server'
import { getSellerHeaders, isMockMode } from '@/lib/apiHelpers'
import { MOCK_PRODUCTS_SUMMARY } from '@/data/mockProducts'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  if (isMockMode()) {
    const name     = searchParams.get('name')?.toLowerCase()
    const brand    = searchParams.get('brand')?.toLowerCase()
    const hasStock = searchParams.get('hasStock') === 'true'
    const offset   = Number(searchParams.get('offset') ?? '0')
    const limit    = Number(searchParams.get('limit') ?? '10')

    let items = [...MOCK_PRODUCTS_SUMMARY]
    if (name)     items = items.filter((p) => p.nombre.toLowerCase().includes(name))
    if (brand)    items = items.filter((p) => p.marca.toLowerCase().includes(brand))
    if (hasStock) items = items.filter((p) => p.stock > 0)

    const total = items.length
    const page  = items.slice(offset, offset + limit).map((p) => ({
      ...p,
      id:        String(p.id),
      vendedorId: String(p.vendedorId),
    }))
    return NextResponse.json({ items: page, total })
  }

  const sellerUrl = process.env.SELLER_API_URL
  if (!sellerUrl) {
    return NextResponse.json({ message: 'Seller API no configurada' }, { status: 500 })
  }

  const externalUrl = new URL(`${sellerUrl}/api/products`)
  searchParams.forEach((value, key) => externalUrl.searchParams.set(key, value))

  console.log('Llamando a:', externalUrl.toString())

  const response = await fetch(externalUrl.toString(), {
    method: 'GET',
    headers: getSellerHeaders(),
  })

  console.log('Seller API status:', response.status)
  if (!response.ok) {
    const errorBody = await response.text()
    console.log('Seller API error body:', errorBody)
  }

  if (response.status === 204) return new NextResponse(null, { status: 204 })
  if (response.status === 404) return NextResponse.json({ message: 'No encontrado' }, { status: 404 })
  if (!response.ok) return NextResponse.json({ message: 'Error en Seller App' }, { status: response.status })

  return NextResponse.json(await response.json())
}