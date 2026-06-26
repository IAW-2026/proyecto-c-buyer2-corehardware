import { Product, ProductSummary } from '@/types/producto'
import { getSellerHeaders } from '@/lib/apiHelpers'

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
// SERVER-SIDE
// ─────────────────────────────────────────────

export async function fetchSellerProducts(
  params: URLSearchParams
): Promise<{ items: ProductSummary[]; total: number }> {
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

export async function fetchSellerById(id: string): Promise<{ razon_social: string } | null> {
  const sellerUrl = process.env.SELLER_API_URL
  if (!sellerUrl) throw new Error('SELLER_API_URL no configurada')

  const res = await fetch(`${sellerUrl}/api/sellers/${id}`, {
    headers: getSellerHeaders(),
    cache: 'no-store',
  })

  if (!res.ok) return null
  return res.json()
}

export async function fetchSellerProductById(id: string): Promise<Product | null> {
  const sellerUrl = process.env.SELLER_API_URL
  if (!sellerUrl) throw new Error('SELLER_API_URL no configurada')

  const res = await fetch(`${sellerUrl}/api/products/${id}`, {
    headers: getSellerHeaders(),
    cache: 'no-store',
  })

  if (!res.ok) return null
  return res.json()
}

// ─────────────────────────────────────────────
// CLIENT-SIDE
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