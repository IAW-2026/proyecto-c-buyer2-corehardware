'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import {
  Box, Flex, Grid, Text, VStack,
  Spinner, Icon, Input, Select, createListCollection,
} from '@chakra-ui/react'
import {
  FaBox, FaExclamationCircle, FaFilter,
  FaChevronDown, FaChevronUp,
} from 'react-icons/fa'
import PaginationAdmin from '@/components/PaginationAdmin'
import PedidoRow, { type PedidoAdmin } from '@/components/admin/PedidoRow'

interface PedidosResponse {
  items: PedidoAdmin[]
  total: number
  limit: number
  offset: number
}

interface Filters {
  estado: string
  compradorNombre: string
  fechaDesde: string
  fechaHasta: string
}

const LIMIT = 10
const FILTERS_EMPTY: Filters = { estado: '', compradorNombre: '', fechaDesde: '', fechaHasta: '' }

const ESTADOS_COLLECTION = createListCollection({
  items: [
    { label: 'Todos los estados', value: '' },
    { label: 'Pendiente de pago', value: 'PENDIENTE_PAGO' },
    { label: 'Pago aprobado',     value: 'PAGO_APROBADO' },
    { label: 'Pago rechazado',    value: 'PAGO_RECHAZADO' },
    { label: 'En preparación',    value: 'EN_PREPARACION' },
    { label: 'En camino',         value: 'EN_CAMINO' },
    { label: 'Entregado',         value: 'ENTREGADO' },
    { label: 'Cancelado',         value: 'CANCELADO' },
  ],
})

function buildSearchParams(filters: Filters, offset: number): string {
  const params = new URLSearchParams()
  params.set('limit', LIMIT.toString())
  params.set('offset', offset.toString())
  if (filters.estado)          params.set('estado', filters.estado)
  if (filters.compradorNombre) params.set('compradorNombre', filters.compradorNombre)
  if (filters.fechaDesde)      params.set('fechaDesde', filters.fechaDesde)
  if (filters.fechaHasta)      params.set('fechaHasta', filters.fechaHasta)
  return params.toString()
}

export default function PedidosPanel() {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()

  const [pedidos, setPedidos]         = useState<PedidoAdmin[]>([])
  const [total, setTotal]             = useState(0)
  const [offset, setOffset]           = useState(0)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const [filters, setFilters]         = useState<Filters>(FILTERS_EMPTY)
  const [applied, setApplied]         = useState<Filters>(FILTERS_EMPTY)
  const [filtersOpen, setFiltersOpen] = useState(true)

  const fetchPedidos = useCallback(async (currentFilters: Filters, currentOffset: number) => {
    setLoading(true)
    setError(null)
    try {
      const qs  = buildSearchParams(currentFilters, currentOffset)
      const res = await fetch(`/api/admin/orders?${qs}`)
      if (res.status === 403) { router.replace('/productos'); return }
      if (!res.ok) throw new Error()
      const data: PedidosResponse = await res.json()
      setPedidos(data.items)
      setTotal(data.total)
    } catch {
      setError('No pudimos cargar los pedidos. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    fetchPedidos(applied, offset)
  }, [isLoaded, isSignedIn, applied, offset, fetchPedidos])

  const handleApplyFilters = () => { setOffset(0); setApplied({ ...filters }) }
  const handleClearFilters = () => { setFilters(FILTERS_EMPTY); setApplied(FILTERS_EMPTY); setOffset(0) }
  const handlePageChange   = (newOffset: number) => { setOffset(newOffset); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const hasActiveFilters   = Object.values(applied).some(v => v !== '')
  const activeFiltersCount = Object.values(applied).filter(v => v !== '').length

  if (!isLoaded) return null

  return (
    <>
      {!loading && (
        <Text fontSize="sm" color="brand.textMuted" mb={4} aria-live="polite">
          {total} {total === 1 ? 'pedido encontrado' : 'pedidos encontrados'}
          {hasActiveFilters && ' (con filtros activos)'}
        </Text>
      )}

      <Box
        bg="brand.bgCard" border="1px solid" borderColor="brand.border"
        borderRadius="xl" p={5} mb={6}
        as="section" aria-label="Filtros de búsqueda"
      >
        <Flex
          align="center" justify="space-between" cursor="pointer"
          onClick={() => setFiltersOpen(p => !p)}
          mb={filtersOpen ? 4 : 0}
          role="button" aria-expanded={filtersOpen} aria-controls="filtros-panel"
        >
          <Flex align="center" gap={2}>
            <Icon as={FaFilter} color="brand.textMuted" boxSize={3} aria-hidden="true" />
            <Text fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider">
              Filtros
            </Text>
            {hasActiveFilters && !filtersOpen && (
              <Text fontSize="xs" color="brand.accent">
                ({activeFiltersCount} {activeFiltersCount === 1 ? 'activo' : 'activos'})
              </Text>
            )}
          </Flex>
          {filtersOpen
            ? <FaChevronUp size={11}  aria-hidden="true" color="var(--chakra-colors-brand-textMuted)" />
            : <FaChevronDown size={11} aria-hidden="true" color="var(--chakra-colors-brand-textMuted)" />
          }
        </Flex>

        {filtersOpen && (
          <Grid templateColumns={{ base: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }} gap={3} mb={4}>

            <VStack align="start" gap={1}>
              <label htmlFor="filtro-estado" style={{ fontSize: '12px', color: 'var(--chakra-colors-brand-textMuted)', display: 'block' }}>
                Estado
              </label>
              <Select.Root
                collection={ESTADOS_COLLECTION}
                value={[filters.estado]}
                onValueChange={(e) => setFilters(prev => ({ ...prev, estado: e.value[0] ?? '' }))}
                size="sm"
              >
                <Select.Trigger id="filtro-estado" bg="brand.bgMain" border="1px solid" borderColor="brand.border" color="brand.textMain" borderRadius="lg">
                  <Select.ValueText placeholder="Todos" />
                </Select.Trigger>
                <Select.Content bg="brand.bgCard" border="1px solid" borderColor="brand.border">
                  {ESTADOS_COLLECTION.items.map((item) => (
                    <Select.Item key={item.value} item={item} color="brand.textMain">{item.label}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </VStack>

            <VStack align="start" gap={1}>
              <label htmlFor="filtro-comprador" style={{ fontSize: '12px', color: 'var(--chakra-colors-brand-textMuted)', display: 'block' }}>
                Comprador
              </label>
              <Input
                id="filtro-comprador" type="text" placeholder="Nombre o apellido..."
                value={filters.compradorNombre}
                onChange={(e) => setFilters(prev => ({ ...prev, compradorNombre: e.target.value }))}
                bg="brand.bgMain" border="1px solid" borderColor="brand.border"
                color="brand.textMain" size="sm" borderRadius="lg"
                _focus={{ borderColor: 'brand.accent', outline: 'none' }}
              />
            </VStack>

            <VStack align="start" gap={1}>
              <label htmlFor="filtro-desde" style={{ fontSize: '12px', color: 'var(--chakra-colors-brand-textMuted)', display: 'block' }}>
                Fecha desde
              </label>
              <Input
                id="filtro-desde" type="date" value={filters.fechaDesde}
                onChange={(e) => setFilters(prev => ({ ...prev, fechaDesde: e.target.value }))}
                bg="brand.bgMain" border="1px solid" borderColor="brand.border"
                color="brand.textMain" size="sm" borderRadius="lg"
                _focus={{ borderColor: 'brand.accent', outline: 'none' }}
              />
            </VStack>

            <VStack align="start" gap={1}>
              <label htmlFor="filtro-hasta" style={{ fontSize: '12px', color: 'var(--chakra-colors-brand-textMuted)', display: 'block' }}>
                Fecha hasta
              </label>
              <Input
                id="filtro-hasta" type="date" value={filters.fechaHasta}
                onChange={(e) => setFilters(prev => ({ ...prev, fechaHasta: e.target.value }))}
                bg="brand.bgMain" border="1px solid" borderColor="brand.border"
                color="brand.textMain" size="sm" borderRadius="lg"
                _focus={{ borderColor: 'brand.accent', outline: 'none' }}
              />
            </VStack>

          </Grid>
        )}

        {filtersOpen && (
          <Flex gap={3} justify="flex-end">
            {hasActiveFilters && (
              <Box
                as="button" px={4} py={2} border="1px solid" borderColor="brand.border"
                borderRadius="lg" color="brand.textMuted" fontSize="sm"
                _hover={{ borderColor: 'brand.accent', color: 'brand.accent' }}
                onClick={handleClearFilters} aria-label="Limpiar todos los filtros"
              >
                Limpiar
              </Box>
            )}
            <Box
              as="button" px={5} py={2} bg="brand.accent" color="brand.bgMain"
              borderRadius="lg" fontSize="sm" fontWeight="bold"
              _hover={{ opacity: 0.85 }} onClick={handleApplyFilters} aria-label="Aplicar filtros"
            >
              Aplicar filtros
            </Box>
          </Flex>
        )}
      </Box>

      <Box
        bg="brand.bgCard" border="1px solid" borderColor="brand.border"
        borderRadius="xl" overflow="hidden"
        as="section" aria-label="Listado de pedidos"
      >
        {loading ? (
          <Flex justify="center" align="center" py={16} role="status" aria-label="Cargando pedidos">
            <VStack gap={3}>
              <Spinner color="brand.accent" size="lg" />
              <Text fontSize="sm" color="brand.textMuted">Cargando pedidos...</Text>
            </VStack>
          </Flex>

        ) : error ? (
          <Flex direction="column" align="center" py={16} gap={4} role="alert">
            <Icon as={FaExclamationCircle} boxSize={8} color="brand.danger" aria-hidden="true" />
            <Text color="brand.textMuted">{error}</Text>
            <Box
              as="button" px={5} py={2} border="1px solid" borderColor="brand.border"
              borderRadius="lg" color="brand.textMain" fontSize="sm"
              _hover={{ borderColor: 'brand.accent', color: 'brand.accent' }}
              onClick={() => fetchPedidos(applied, offset)} aria-label="Reintentar"
            >
              Reintentar
            </Box>
          </Flex>

        ) : pedidos.length === 0 ? (
          <Flex direction="column" align="center" py={16} gap={3}>
            <Icon as={FaBox} boxSize={8} color="brand.textMuted" aria-hidden="true" />
            <Text color="brand.textMuted">
              {hasActiveFilters ? 'No hay pedidos con esos filtros.' : 'No hay pedidos todavía.'}
            </Text>
          </Flex>

        ) : (
          <Box overflowX="auto" role="region" aria-label="Tabla de pedidos">
            <Box as="table" w="full" role="table" aria-label="Listado de pedidos del sistema">
              <Box as="thead" role="rowgroup">
                <Box as="tr" role="row" borderBottom="1px solid" borderColor="brand.border">
                  {['#', 'Comprador', 'Fecha', 'Estado', 'Productos', 'Monto'].map((col) => (
                    <Box
                      as="th" key={col} role="columnheader" px={4} py={3}
                      fontSize="xs" color="brand.textMuted" textTransform="uppercase"
                      letterSpacing="wider" fontWeight="semibold"
                      textAlign={col === 'Monto' ? 'right' : col === 'Productos' ? 'center' : 'left'}
                    >
                      {col}
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box as="tbody" role="rowgroup">
                {pedidos.map((pedido) => (
                  <PedidoRow key={pedido.id} pedido={pedido} />
                ))}
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {total > LIMIT && (
        <PaginationAdmin
          totalItems={total}
          limit={LIMIT}
          offset={offset}
          onPageChange={handlePageChange}
        />
      )}
    </>
  )
}