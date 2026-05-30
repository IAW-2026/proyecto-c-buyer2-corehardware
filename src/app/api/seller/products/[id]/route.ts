/**
 * Mock interno — GET /api/seller/products/[id]
 * Simula el detalle de un producto de la Seller App.
 */

import { NextRequest, NextResponse } from 'next/server'
import { MOCK_PRODUCTS_DETAIL } from '@/data/mockProducts'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const producto = MOCK_PRODUCTS_DETAIL.find(p => p.id === parseInt(id))

  if (!producto) {
    return NextResponse.json({ message: 'Producto no encontrado' }, { status: 404 })
  }

  return NextResponse.json(producto)
}