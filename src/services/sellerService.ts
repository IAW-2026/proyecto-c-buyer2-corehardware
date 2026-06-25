/**
 * sellerService.ts — Servicio para consumir la Seller App
 *
 * ARQUITECTURA:
 *   Browser → sellerService → /api/seller/... (proxy interno)
 *   El proxy interno llama a la Seller App real con la API key,
 *   que vive solo en el servidor y nunca se expone al browser.
 */

import { Product, ProductSummary } from '@/types/producto'

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
// Servicio
// ─────────────────────────────────────────────
export const SellerService = {

  /**
   * GET /products — lista paginada con filtros
   * Contrato (03-apis.md): offset, limit, name, brand, hasStock, sellerId, seller
   */
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

    const response = await fetch(`/api/seller/products?${searchParams.toString()}`, {
      method: 'GET',
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
   * Contrato (03-apis.md): Response 200 con datos completos del producto
   */
  async getProductById(id: string): Promise<Product | null> {
    const response = await fetch(`/api/seller/products/${id}`, {
      method: 'GET',
    })

    if (response.status === 404) return null
    if (!response.ok) throw new Error(`Error al obtener producto ${id}: ${response.status}`)

    return response.json()
  },

  /**
   * GET /sellers/:id — datos de un vendedor
   * Contrato (03-apis.md): Response 200 con datos completos del vendedor
   */
  async getSellerById(id: string): Promise<Seller | null> {
    const response = await fetch(`/api/seller/sellers/${id}`, {
      method: 'GET',
    })

    if (response.status === 404) return null
    if (!response.ok) throw new Error(`Error al obtener vendedor ${id}: ${response.status}`)

    return response.json()
  },
}