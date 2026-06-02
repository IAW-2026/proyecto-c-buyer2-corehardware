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
  // Datos
  data: ProductosState
  loading: boolean
  // Filtros activos (leídos de la URL)
  search: string
  marca: string
  vendedor: string
  page: number
  offset: number
  // Opciones para los selects
  todasLasMarcas: string[]
  todosLosVendedores: string[]
  // Estado derivado
  hayFiltrosActivos: boolean
  // Handlers
  handleMarcaChange: (nuevaMarca: string) => void
  handleVendedorChange: (nuevoVendedor: string) => void
  handleLimpiarFiltros: () => void
  handlePageChange: (newOffset: number) => void
}

export function useProductosFiltros(): UseProductosFiltrosReturn {
  const router = useRouter()
  const searchParams = useSearchParams()

  // ── Leer filtros desde la URL ──────────────────────────────────────────
  const search = searchParams.get('search') || ''
  const marca = searchParams.get('marca') || ''
  const vendedor = searchParams.get('vendedor') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const offset = (page - 1) * LIMIT

  // ── Estado ────────────────────────────────────────────────────────────
  const [data, setData] = useState<ProductosState>({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [todasLasMarcas, setTodasLasMarcas] = useState<string[]>([])
  const [todosLosVendedores, setTodosLosVendedores] = useState<string[]>([])

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

  // ── Fetch de productos ────────────────────────────────────────────────
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

        const result: ProductosState = res?.items ? res : { items: [], total: 0 }
        setData(result)

        // Poblar opciones de filtros solo en la carga inicial (sin filtros activos)
        // para tener el universo completo de opciones disponibles
        const esCargaInicial = !marca && !vendedor && !search && page === 1
        if (esCargaInicial) {
          const marcasUnicas = [
            ...new Set(result.items.map((p) => p.marca).filter(Boolean)),
          ].sort() as string[]

          const vendedoresUnicos = [
            ...new Set(result.items.map((p) => p.vendedor).filter(Boolean)),
          ].sort() as string[]

          setTodasLasMarcas(marcasUnicas)
          setTodosLosVendedores(vendedoresUnicos)
        }
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