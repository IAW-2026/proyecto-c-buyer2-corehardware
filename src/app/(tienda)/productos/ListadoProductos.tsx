'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Box, Flex, SimpleGrid, Text,
  Button, Heading, Badge, VStack, Spinner, Center, Icon,
} from '@chakra-ui/react'
import { FaSearch } from 'react-icons/fa'
import { SellerService } from '@/services/sellerService'
import Pagination from '@/components/Pagination'
import ProductoCard from '@/components/productos/ProductCard'
import FiltrosProductos from '@/components/productos/FiltrosProductos'
import { ProductSummary } from '@/types/producto'
import NextImage from 'next/image'

const LIMIT = 20

export default function ListadoProductos() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // ── Leer filtros desde la URL ────────────────────────────────────────────
  const search = searchParams.get('search') || ''
  const marca = searchParams.get('marca') || ''
  const vendedor = searchParams.get('vendedor') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const offset = (page - 1) * LIMIT

  // ── Estado ───────────────────────────────────────────────────────────────
  const [data, setData] = useState<{ items: ProductSummary[]; total: number }>({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)

  // ── Opciones para los selects (marcas y vendedores únicos) ───────────────
  const [todasLasMarcas, setTodasLasMarcas] = useState<string[]>([])
  const [todosLosVendedores, setTodosLosVendedores] = useState<string[]>([])

  // ── Actualizar URL con los filtros ───────────────────────────────────────
  const actualizarURL = useCallback((params: Record<string, string>) => {
    const current = new URLSearchParams(searchParams.toString())

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        current.set(key, value)
      } else {
        current.delete(key)
      }
    })

    // Cuando cambia un filtro, volver a page 1
    if (!params.page) {
      current.set('page', '1')
    }

    router.push(`/productos?${current.toString()}`)
  }, [router, searchParams])

  // ── Cargar productos ─────────────────────────────────────────────────────
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
        const result = res?.items ? res : { items: [], total: 0 }
        setData(result)

        // Extraer marcas y vendedores únicos para los selects
        // Solo en la primera carga (sin filtros) para tener todas las opciones
        if (!marca && !vendedor && !search && page === 1) {
          const marcasUnicas = [...new Set(result.items.map((p) => p.marca).filter(Boolean))].sort()
          const vendedoresUnicos = [...new Set(result.items.map((p) => p.vendedor).filter(Boolean))].sort()
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

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleMarcaChange = (nuevaMarca: string) => {
    actualizarURL({ marca: nuevaMarca })
  }

  const handleVendedorChange = (nuevoVendedor: string) => {
    actualizarURL({ vendedor: nuevoVendedor })
  }

  const handleLimpiarFiltros = () => {
    const current = new URLSearchParams()
    if (search) current.set('search', search)
    current.set('page', '1')
    router.push(`/productos?${current.toString()}`)
  }

  const handlePageChange = (newOffset: number) => {
    const newPage = Math.floor(newOffset / LIMIT) + 1
    actualizarURL({ page: newPage.toString() })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const hayFiltrosActivos = !!(marca || vendedor)

  // ── Estados de carga ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <Box as="main" bg="brand.bgMain" minH="100vh">
        <Center mt={20}>
          <VStack gap={4}>
            <Spinner color="brand.accent" size="xl" borderWidth="4px" />
            <Text color="brand.accent" fontWeight="bold" letterSpacing="widest">
              CARGANDO HARDWARE...
            </Text>
          </VStack>
        </Center>
      </Box>
    )
  }

  if (data.items.length === 0) {
    return (
      <Box as="main" bg="brand.bgMain" minH="100vh">
        <Center mt={20} p={10}>
          <VStack gap={6}>
            <Box fontSize="6xl" color="brand.accent">
              <Icon as={FaSearch} aria-hidden="true" />
            </Box>
            <Heading size="lg" textAlign="center" color="brand.textMain">
              No hay productos disponibles
            </Heading>
            {hayFiltrosActivos && (
              <Text color="brand.textMuted" textAlign="center">
                Probá con otros filtros o eliminá los actuales.
              </Text>
            )}
            <Button
              variant="outline"
              borderColor="brand.accent"
              color="brand.accent"
              onClick={handleLimpiarFiltros}
              borderRadius="full"
              px={10}
              py={6}
              fontSize="md"
              fontWeight="bold"
              aria-label="Limpiar filtros y reintentar"
            >
              {hayFiltrosActivos ? 'Limpiar filtros' : 'Reintentar'}
            </Button>
          </VStack>
        </Center>
      </Box>
    )
  }

  return (
    <Box as="main" bg="brand.bgMain" minH="100vh" color="brand.textMain">

      {/* Banner */}
      <Box w="full" px={{ base: 4, md: 8 }} mt={6}>
        <Box
          borderRadius="2xl"
          overflow="hidden"
          cursor="pointer"
          onClick={() => router.push('/productos')}
        >
          <img
            src="/images/banner-envio-gratis.png"
            alt="Envío gratis superando los $500.000"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
        </Box>
      </Box>

      {/* Contenido: filtros + grilla */}
      <Flex
        w="full"
        px={8}
        py={10}
        gap={6}
        align="flex-start"
        direction={{ base: 'column', lg: 'row' }}
      >
        {/* Panel de filtros */}
        <FiltrosProductos
          marcas={todasLasMarcas}
          vendedores={todosLosVendedores}
          marcaSeleccionada={marca}
          vendedorSeleccionado={vendedor}
          onMarcaChange={handleMarcaChange}
          onVendedorChange={handleVendedorChange}
          onLimpiar={handleLimpiarFiltros}
          hayFiltrosActivos={hayFiltrosActivos}
        />

        {/* Grilla de productos */}
        <Box flex={1} minW={0}>
          <SimpleGrid
            columns={{ base: 1, sm: 2, md: 3, lg: 3, xl: 4 }}
            gap="6"
            as="section"
            aria-label="Listado de productos"
          >
            {data.items.map((prod) => (
              <ProductoCard key={prod.id} producto={prod} />
            ))}
          </SimpleGrid>

          <Pagination
            totalItems={data.total}
            limit={LIMIT}
            offset={offset}
            onPageChange={handlePageChange}
          />
        </Box>
      </Flex>
    </Box>
  )
}