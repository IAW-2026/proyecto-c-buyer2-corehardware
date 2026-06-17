'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SellerService } from '@/services/sellerService'
import { ProductSummary } from '@/types/producto'

const LIMIT = 20

interface ProductosState {
  items: ProductSummary[]
  total: number
}

interface UseProductosFiltrosReturn {
  data: ProductosState
  loading: boolean
  search: string
  marca: string
  vendedor: string
  page: number
  offset: number
  todasLasMarcas: string[]
  todosLosVendedores: string[]
  hayFiltrosActivos: boolean
  handleMarcaChange: (nuevaMarca: string) => void
  handleVendedorChange: (nuevoVendedor: string) => void
  handleLimpiarFiltros: () => void
  handlePageChange: (newOffset: number) => void
}

export function useProductosFiltros(): UseProductosFiltrosReturn {
  const router = useRouter()
  const searchParams = useSearchParams()

  const search = searchParams.get('search') || ''
  const marca = searchParams.get('marca') || ''
  const vendedor = searchParams.get('vendedor') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const offset = (page - 1) * LIMIT

  const [data, setData] = useState<ProductosState>({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [todasLasMarcas, setTodasLasMarcas] = useState<string[]>([])
  const [todosLosVendedores, setTodosLosVendedores] = useState<string[]>([])

  // ── Carga opciones de filtros UNA sola vez ────────────────────────────
  useEffect(() => {
    const cargarOpciones = async () => {
      try {
        const res = await SellerService.getProducts({
          offset: 0,
          limit: 200,
          hasStock: true,
        })
        const items = res?.items ?? []

        setTodasLasMarcas(
          [...new Set(items.map((p) => p.marca).filter(Boolean))].sort() as string[]
        )
        setTodosLosVendedores(
          [...new Set(items.map((p) => p.vendedor).filter(Boolean))].sort() as string[]
        )
      } catch (error) {
        console.error('Error cargando opciones de filtros:', error)
      }
    }

    cargarOpciones()
  }, [])

  // ── Actualizar URL ────────────────────────────────────────────────────
  const actualizarURL = useCallback(
    (params: Record<string, string>) => {
      const current = new URLSearchParams(searchParams.toString())

      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          current.set(key, value)
        } else {
          current.delete(key)
        }
      })

      if (!params.page) {
        current.set('page', '1')
      }

      router.push(`/productos?${current.toString()}`)
    },
    [router, searchParams],
  )

  // ── Fetch de productos filtrados ──────────────────────────────────────
  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true)
      try {
        const res = await SellerService.getProducts({
          offset,
          limit: LIMIT,
          name: search,
          brand: marca,
          hasStock: true,
          seller: vendedor,
        })

        setData(res?.items ? res : { items: [], total: 0 })
      } catch (error) {
        console.error('Error cargando productos:', error)
        setData({ items: [], total: 0 })
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [search, marca, vendedor, offset, page])

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleMarcaChange = useCallback(
    (nuevaMarca: string) => actualizarURL({ marca: nuevaMarca }),
    [actualizarURL],
  )

  const handleVendedorChange = useCallback(
    (nuevoVendedor: string) => actualizarURL({ vendedor: nuevoVendedor }),
    [actualizarURL],
  )

  const handleLimpiarFiltros = useCallback(() => {
    const current = new URLSearchParams()
    if (search) current.set('search', search)
    current.set('page', '1')
    router.push(`/productos?${current.toString()}`)
  }, [search, router])

  const handlePageChange = useCallback(
    (newOffset: number) => {
      const newPage = Math.floor(newOffset / LIMIT) + 1
      actualizarURL({ page: newPage.toString() })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [actualizarURL],
  )

  return {
    data,
    loading,
    search,
    marca,
    vendedor,
    page,
    offset,
    todasLasMarcas,
    todosLosVendedores,
    hayFiltrosActivos: !!(marca || vendedor),
    handleMarcaChange,
    handleVendedorChange,
    handleLimpiarFiltros,
    handlePageChange,
  }
}

export { LIMIT }