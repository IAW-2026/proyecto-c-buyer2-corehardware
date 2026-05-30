/**
 * sellerService.ts — Servicio para consumir la Seller App
 *
 * ARQUITECTURA:
 *   Frontend → sellerService → /api/seller/... (mock interno, Etapa 2)
 *                           → SELLER_API_URL/... (app de Sebastián, Etapa 3)
 *
 * Para pasar a Etapa 3: definir NEXT_PUBLIC_SELLER_API_URL en .env.local
 */

import { Product, ProductSummary } from '@/types/producto'

// ─────────────────────────────────────────────
// Tipos locales
// ─────────────────────────────────────────────
export interface Seller {
  id: number
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
  seller?: string
}

// ─────────────────────────────────────────────
// Helper de routing — igual patrón que paymentService
// ─────────────────────────────────────────────
function getSellerBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SELLER_API_URL ?? '/api/seller'
}

function getHeaders(): HeadersInit {
  const apiKey = process.env.NEXT_PUBLIC_SELLER_API_KEY
  return {
    'Content-Type': 'application/json',
    ...(apiKey ? { 'X-API-Key': apiKey } : {}),
  }
}

// ─────────────────────────────────────────────
// Servicio
// ─────────────────────────────────────────────
export const SellerService = {

  /**
   * GET /products — lista paginada con filtros
   */
  async getProducts(
    params: GetProductsParams
  ): Promise<{ items: ProductSummary[]; total: number }> {
    const { offset, limit, name, brand, hasStock, seller } = params
    const base = getSellerBaseUrl()

    const url = new URL(`${base}/products`, 'http://localhost') // base ficticia para parsear params
    url.searchParams.set('offset', offset.toString())
    url.searchParams.set('limit', limit.toString())
    if (name)     url.searchParams.set('name', name)
    if (brand)    url.searchParams.set('brand', brand)
    if (hasStock) url.searchParams.set('hasStock', 'true')
    if (seller)   url.searchParams.set('seller', seller)

    // Reconstruimos solo el path+query para fetch relativo o absoluto
    const fetchUrl = base.startsWith('http')
      ? url.toString()
      : `${base}/products?${url.searchParams.toString()}`

    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: getHeaders(),
    })

    if (response.status === 204) return { items: [], total: 0 }
    if (response.status === 404) return { items: [], total: 0 }
    if (!response.ok) throw new Error(`Error al obtener productos: ${response.status}`)

    const data = await response.json()
    return {
      items: data.items ?? data,
      total: data.total ?? data.length ?? 0,
    }
  },

  /**
   * GET /products/:id — detalle de un producto
   */
  async getProductById(id: number): Promise<Product | null> {
    const base = getSellerBaseUrl()

    const response = await fetch(`${base}/products/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    })

    if (response.status === 404) return null
    if (!response.ok) throw new Error(`Error al obtener producto ${id}: ${response.status}`)

    return response.json()
  },

  /**
   * GET /sellers/:id — datos de un vendedor
   */
  async getSellerById(id: number): Promise<Seller | null> {
    const base = getSellerBaseUrl()

    const response = await fetch(`${base}/sellers/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    })

    if (response.status === 404) return null
    if (!response.ok) throw new Error(`Error al obtener vendedor ${id}: ${response.status}`)

    return response.json()
  },
}
