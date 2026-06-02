'use client'

import { useRouter } from 'next/navigation'
import { Box, Flex, SimpleGrid } from '@chakra-ui/react'
import { useProductosFiltros, LIMIT } from '@/app/hooks/useProductosFiltros'
import { ProductosLoading, ProductosEmptyState } from '@/components/productos/ProductosEstados'
import Pagination from '@/components/Pagination'
import ProductoCard from '@/components/productos/ProductCard'
import FiltrosProductos from '@/components/productos/FiltrosProductos'
import { ProductSummary } from '@/types/producto'

export default function ListadoProductos() {
  const router = useRouter()
  const {
    data,
    loading,
    marca,
    vendedor,
    offset,
    todasLasMarcas,
    todosLosVendedores,
    hayFiltrosActivos,
    handleMarcaChange,
    handleVendedorChange,
    handleLimpiarFiltros,
    handlePageChange,
  } = useProductosFiltros()

  if (loading) {
    return <ProductosLoading />
  }

  if (data.items.length === 0) {
    return (
      <ProductosEmptyState
        hayFiltrosActivos={hayFiltrosActivos}
        onLimpiarFiltros={handleLimpiarFiltros}
      />
    )
  }

  return (
    <Box as="main" bg="brand.bgMain" minH="100vh" color="brand.textMain">

      {/* Banner promocional */}
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
          <img
            src="/images/banner-envio-gratis.png"
            alt="Envío gratis superando los $500.000"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </Box>
      </Box>

      {/* Filtros + grilla */}
      <Flex
        w="full"
        px={8}
        py={10}
        gap={6}
        align="flex-start"
        direction={{ base: 'column', lg: 'row' }}
      >
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
            {data.items.map((prod: ProductSummary) => (
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