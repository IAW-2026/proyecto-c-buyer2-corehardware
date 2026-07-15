'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Box, Flex, SimpleGrid } from '@chakra-ui/react'
import { ProductosEmptyState } from '@/components/productos/ProductosEstadosClient'
import Pagination from '@/components/Pagination'
import ProductoCard from '@/components/productos/ProductCard'
import FiltrosProductos from '@/components/productos/FiltrosProductos'
import { ProductSummary } from '@/types/producto'
import Image from 'next/image'

const LIMIT = 20

interface Props {
  items: ProductSummary[]
  total: number
  offset: number
  search: string
  marca: string
  vendedor: string
  todasLasMarcas: string[]
  todosLosVendedores: string[]
}

export default function ListadoProductos({
  items, total, offset, search, marca, vendedor,
  todasLasMarcas, todosLosVendedores,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const hayFiltrosActivos = !!(marca || vendedor)

  const actualizarURL = (nuevosParams: Record<string, string>) => {
    const current = new URLSearchParams()
    if (search) current.set('search', search)
    if (marca) current.set('marca', marca)
    if (vendedor) current.set('vendedor', vendedor)

    Object.entries(nuevosParams).forEach(([key, value]) => {
      value ? current.set(key, value) : current.delete(key)
    })
    current.set('page', '1')
    router.push(`${pathname}?${current.toString()}`)
  }

  const handleMarcaChange = (nuevaMarca: string) =>
    actualizarURL({ marca: nuevaMarca })

  const handleVendedorChange = (nuevoVendedor: string) =>
    actualizarURL({ vendedor: nuevoVendedor })

  const handleLimpiarFiltros = () => {
    const current = new URLSearchParams()
    if (search) current.set('search', search)
    current.set('page', '1')
    router.push(`${pathname}?${current.toString()}`)
  }

  const handlePageChange = (newOffset: number) => {
    const newPage = Math.floor(newOffset / LIMIT) + 1
    actualizarURL({ page: newPage.toString() })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (items.length === 0) {
    return (
      <ProductosEmptyState
        hayFiltrosActivos={hayFiltrosActivos}
        onLimpiarFiltros={handleLimpiarFiltros}
      />
    )
  }

  return (
    <Box as="main" bg="brand.bgMain" minH="100vh" color="brand.textMain">
      <Box w="full" px={{ base: 4, md: 8 }} mt={6}>
        <Box
          borderRadius="2xl"
          overflow="hidden"
          cursor="pointer"
          onClick={() => router.push('/productos')}
          role="link"
          aria-label="Ir al listado de productos — Envío gratis superando los $500.000"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && router.push('/productos')}
        >
          <Image
            src="/images/banner-envio-gratis.png"
            alt="Envío gratis superando los $500.000"
            width={1200}
            height={200}
            style={{ width: '100%', height: 'auto', display: 'block' }}
            priority
          />
        </Box>
      </Box>

      <Flex w="full" px={8} py={10} gap={6} align="flex-start" direction={{ base: 'column', lg: 'row' }}>
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

        <Box flex={1} minW={0}>
          <SimpleGrid
            columns={{ base: 1, sm: 2, md: 3, lg: 3, xl: 4 }}
            gap="6"
            as="section"
            aria-label="Listado de productos"
          >
            {items.map((prod) => (
              <ProductoCard key={prod.id} producto={prod} />
            ))}
          </SimpleGrid>

          <Pagination
            totalItems={total}
            limit={LIMIT}
            offset={offset}
            onPageChange={handlePageChange}
          />
        </Box>
      </Flex>
    </Box>
  )
}