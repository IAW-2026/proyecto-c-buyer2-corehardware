/**
 * sellerService.ts — Servicio para consumir la Seller App
 *
 * ARQUITECTURA:
 *   Browser  → fetch('/api/seller/...') → proxy interno → Seller App
 *   Servidor → fetchSellerDirect(...)   → Seller App directamente
 *
 * Las funciones del objeto SellerService usan rutas relativas y solo
 * deben llamarse desde el cliente (Client Components, CartContext, etc.)
 *
 * fetchSellerProducts / fetchSellerProductById son para Server Components.
 */

import { Product, ProductSummary } from '@/types/producto'
import { getSellerHeaders, isMockMode } from '@/lib/apiHelpers'
import { MOCK_PRODUCTS_SUMMARY } from '@/data/mockProducts'

// ─────────────────────────────────────────────
// Tipos locales
// ─────────────────────────────────────────────
export interface Seller {
  id: string
  cuit: string
  razon_social: string
  direccion: string
  mail: string
  celular: string
  condicion_iva: string
}

export interface GetProductsParams {
  offset: number
  limit: number
  name?: string
  brand?: string
  hasStock?: boolean
  sellerId?: string
  seller?: string
}

// ─────────────────────────────────────────────
// SERVER-SIDE: llamada directa a la Seller App
// Solo usar desde Server Components o Route Handlers
// ─────────────────────────────────────────────

export async function fetchSellerProducts(
  params: URLSearchParams
): Promise<{ items: ProductSummary[]; total: number }> {
  if (isMockMode()) {
    const name     = params.get('name')?.toLowerCase()
    const brand    = params.get('brand')?.toLowerCase()
    const hasStock = params.get('hasStock') === 'true'
    const offset   = Number(params.get('offset') ?? '0')
    const limit    = Number(params.get('limit') ?? '10')

    let items = [...MOCK_PRODUCTS_SUMMARY]
    if (name)     items = items.filter((p) => p.nombre.toLowerCase().includes(name))
    if (brand)    items = items.filter((p) => p.marca.toLowerCase().includes(brand))
    if (hasStock) items = items.filter((p) => p.stock > 0)

    const total = items.length
    const page  = items.slice(offset, offset + limit).map((p) => ({
      ...p,
      id:         String(p.id),
      vendedorId: String(p.vendedorId),
    }))
    return { items: page as ProductSummary[], total }
  }

  const sellerUrl = process.env.SELLER_API_URL
  if (!sellerUrl) throw new Error('SELLER_API_URL no configurada')

  const url = new URL(`${sellerUrl}/api/products`)
  params.forEach((value, key) => url.searchParams.set(key, value))

  const res = await fetch(url.toString(), {
    headers: getSellerHeaders(),
    cache: 'no-store',
  })

  if (!res.ok) return { items: [], total: 0 }
  return res.json()
}

// ─────────────────────────────────────────────
// CLIENT-SIDE: proxy interno (sin API key expuesta)
// Solo usar desde Client Components
// ─────────────────────────────────────────────
export const SellerService = {

  async getProducts(
    params: GetProductsParams
  ): Promise<{ items: ProductSummary[]; total: number }> {
    const { offset, limit, name, brand, hasStock, sellerId, seller } = params

    const searchParams = new URLSearchParams()
    searchParams.set('offset', offset.toString())
    searchParams.set('limit', limit.toString())
    if (name)     searchParams.set('name', name)
    if (brand)    searchParams.set('brand', brand)
    if (hasStock) searchParams.set('hasStock', 'true')
    if (sellerId) searchParams.set('sellerId', sellerId)
    if (seller)   searchParams.set('seller', seller)

    const response = await fetch(`/api/seller/products?${searchParams.toString()}`)

    if (response.status === 204) return { items: [], total: 0 }
    if (response.status === 404) return { items: [], total: 0 }
    if (!response.ok) throw new Error(`Error al obtener productos: ${response.status}`)

    const data = await response.json()
    return {
      items: data.items ?? data,
      total: data.total ?? data.length ?? 0,
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    const response = await fetch(`/api/seller/products/${id}`)
    if (response.status === 404) return null
    if (!response.ok) throw new Error(`Error al obtener producto ${id}: ${response.status}`)
    return response.json()
  },

  async getSellerById(id: string): Promise<Seller | null> {
    const response = await fetch(`/api/seller/sellers/${id}`)
    if (response.status === 404) return null
    if (!response.ok) throw new Error(`Error al obtener vendedor ${id}: ${response.status}`)
    return response.json()
  },
}