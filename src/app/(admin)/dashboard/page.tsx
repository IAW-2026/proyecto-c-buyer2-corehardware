'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import {
  Box, Container, Flex, Grid, Text, VStack,
  HStack, Spinner, Icon, Input, Select,
  createListCollection,
} from '@chakra-ui/react'
import {
  FaBox, FaExclamationCircle, FaFilter,
  FaCheckCircle, FaClock, FaTruck, FaTimesCircle, FaTools,
  FaChevronDown, FaChevronUp,
} from 'react-icons/fa'
import PaginationAdmin from '@/components/PaginationAdmin'
import { formatFecha } from '@/utils/formatDate'

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────
interface PedidoAdmin {
  id: number
  fecha: string
  monto: number
  estado: string
  vendedor_id: number
  envio_id: number | null
  productos: number[]
  comprador: {
    id: number
    nombre: string
    mail: string
  }
}

interface PedidosResponse {
  items: PedidoAdmin[]
  total: number
  limit: number
  offset: number
}

interface Stats {
  total: number
  entregados: number
  enCamino: number
  pendientes: number
}

// ─────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────
const LIMIT = 10

const ESTADOS_COLLECTION = createListCollection({
  items: [
    { label: 'Todos los estados', value: '' },
    { label: 'Pendiente de pago', value: 'PENDIENTE_PAGO' },
    { label: 'Pago aprobado', value: 'PAGO_APROBADO' },
    { label: 'Pago rechazado', value: 'PAGO_RECHAZADO' },
    { label: 'En preparación', value: 'EN_PREPARACION' },
    { label: 'En camino', value: 'EN_CAMINO' },
    { label: 'Entregado', value: 'ENTREGADO' },
    { label: 'Cancelado', value: 'CANCELADO' },
  ],
})

const ESTADO_CONFIG: Record<string, { color: string; icon: React.ElementType }> = {
  PENDIENTE_PAGO: { color: '#F0A500', icon: FaClock },
  PAGO_APROBADO: { color: '#00D1FF', icon: FaCheckCircle },
  PAGO_RECHAZADO: { color: '#F85149', icon: FaTimesCircle },
  EN_PREPARACION: { color: '#A78BFA', icon: FaTools },
  EN_CAMINO: { color: '#34D399', icon: FaTruck },
  ENTREGADO: { color: '#34D399', icon: FaCheckCircle },
  CANCELADO: { color: '#8B949E', icon: FaTimesCircle },
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatMonto(monto: number): string {
  return monto.toLocaleString('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  })
}

function buildSearchParams(filters: Filters, offset: number): string {
  const params = new URLSearchParams()
  params.set('limit', LIMIT.toString())
  params.set('offset', offset.toString())
  if (filters.estado) params.set('estado', filters.estado)
  if (filters.compradorId) params.set('compradorId', filters.compradorId)
  if (filters.fechaDesde) params.set('fechaDesde', filters.fechaDesde)
  if (filters.fechaHasta) params.set('fechaHasta', filters.fechaHasta)
  return params.toString()
}

// ─────────────────────────────────────────────
// Tipos de filtros
// ─────────────────────────────────────────────
interface Filters {
  estado: string
  compradorId: string
  fechaDesde: string
  fechaHasta: string
}

const FILTERS_EMPTY: Filters = {
  estado: '', compradorId: '', fechaDesde: '', fechaHasta: '',
}

// ─────────────────────────────────────────────
// Componentes internos
// ─────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <Box
      bg="brand.bgCard"
      border="1px solid"
      borderColor="brand.border"
      borderRadius="xl"
      p={5}
    >
      <Text fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider" mb={1}>
        {label}
      </Text>
      <Text fontSize="2xl" fontWeight="black" color={color}>
        {value}
      </Text>
    </Box>
  )
}

function PedidoRow({ pedido }: { pedido: PedidoAdmin }) {
  const cfg = ESTADO_CONFIG[pedido.estado] ?? { color: '#8B949E', icon: FaBox }

  return (
    <Box
      as="tr"
      role="row"
      _hover={{ bg: 'rgba(255,255,255,0.02)' }}
      transition="background 0.15s"
    >
      <Box as="td" px={4} py={3} fontFamily="mono" fontSize="sm" color="brand.textMuted">
        #{pedido.id}
      </Box>
      <Box as="td" px={4} py={3} fontSize="sm" color="brand.textMain">
        {pedido.comprador.nombre}
        <Text fontSize="xs" color="brand.textMuted">{pedido.comprador.mail}</Text>
      </Box>
      <Box as="td" px={4} py={3} fontSize="sm" color="brand.textMuted">
        {formatFecha(pedido.fecha)}
      </Box>
      <Box as="td" px={4} py={3}>
        <HStack gap={1.5}>
          <Icon as={cfg.icon} color={cfg.color} boxSize={3} aria-hidden="true" />
          <Text fontSize="xs" fontWeight="semibold" color={cfg.color}>
            {ESTADOS_COLLECTION.items.find(e => e.value === pedido.estado)?.label ?? pedido.estado}
          </Text>
        </HStack>
      </Box>
      <Box as="td" px={4} py={3} fontSize="sm" color="brand.textMuted" textAlign="center">
        {pedido.productos.length}
      </Box>
      <Box as="td" px={4} py={3} fontSize="sm" fontWeight="bold" color="brand.accent" textAlign="right">
        {formatMonto(pedido.monto)}
      </Box>
    </Box>
  )
}

// ─────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────
export default function DashboardPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()

  const [pedidos, setPedidos] = useState<PedidoAdmin[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>(FILTERS_EMPTY)
  const [applied, setApplied] = useState<Filters>(FILTERS_EMPTY)
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [stats, setStats] = useState<Stats>({ total: 0, entregados: 0, enCamino: 0, pendientes: 0 })

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/orders/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch {}
  }, [])

  const fetchPedidos = useCallback(async (currentFilters: Filters, currentOffset: number) => {
    setLoading(true)
    setError(null)
    try {
      const qs = buildSearchParams(currentFilters, currentOffset)
      const res = await fetch(`/api/admin/orders?${qs}`)
      if (res.status === 403) { router.replace('/productos'); return }
      if (!res.ok) throw new Error('Error al cargar pedidos')
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
    if (!isLoaded) return
    if (!isSignedIn) { router.push('/sign-in'); return }
    fetchPedidos(applied, offset)
    fetchStats()
  }, [isLoaded, isSignedIn, applied, offset, fetchPedidos, fetchStats, router])

  const handleApplyFilters = () => {
    setOffset(0)
    setApplied({ ...filters })
  }

  const handleClearFilters = () => {
    setFilters(FILTERS_EMPTY)
    setApplied(FILTERS_EMPTY)
    setOffset(0)
  }

  const handlePageChange = (newOffset: number) => {
    setOffset(newOffset)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const hasActiveFilters = Object.values(applied).some(v => v !== '')
  const activeFiltersCount = Object.values(applied).filter(v => v !== '').length

  if (!isLoaded) {
    return (
      <Container maxW="container.xl" py={8} px={{ base: 4, md: 6 }}>
        <Flex justify="center" align="center" minH="60vh" role="status" aria-label="Cargando">
          <Spinner color="brand.accent" size="lg" />
        </Flex>
      </Container>
    )
  }

  return (
    <Container maxW="container.xl" py={8} px={{ base: 4, md: 6 }}>

      {/* Encabezado */}
      <Flex align="center" justify="space-between" mb={8} wrap="wrap" gap={4}>
        <VStack align="start" gap={0}>
          <Text fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider">
            Panel de administración
          </Text>
          <Text fontSize="2xl" fontWeight="black" color="brand.textMain">
            Dashboard
          </Text>
        </VStack>
        {!loading && (
          <Text fontSize="sm" color="brand.textMuted" aria-live="polite">
            {total} {total === 1 ? 'pedido encontrado' : 'pedidos encontrados'}
            {hasActiveFilters && ' (con filtros activos)'}
          </Text>
        )}
      </Flex>

      {/* Stats reales */}
      <Grid
        templateColumns={{ base: '1fr 1fr', md: 'repeat(4, 1fr)' }}
        gap={4}
        mb={8}
        aria-label="Resumen de pedidos"
      >
        <StatCard label="Total pedidos" value={stats.total} color="brand.accent" />
        <StatCard label="Entregados" value={stats.entregados} color="#34D399" />
        <StatCard label="En camino" value={stats.enCamino} color="#00D1FF" />
        <StatCard label="Pendientes" value={stats.pendientes} color="#F0A500" />
      </Grid>

      {/* Filtros */}
      <Box
        bg="brand.bgCard"
        border="1px solid"
        borderColor="brand.border"
        borderRadius="xl"
        p={5}
        mb={6}
        as="section"
        aria-label="Filtros de búsqueda"
      >
        <Flex
          align="center"
          justify="space-between"
          cursor="pointer"
          onClick={() => setFiltersOpen(p => !p)}
          mb={filtersOpen ? 4 : 0}
          role="button"
          aria-expanded={filtersOpen}
          aria-controls="filtros-panel"
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
            ? <FaChevronUp size={11} aria-hidden="true" color="var(--chakra-colors-brand-textMuted)" />
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
                id="filtro-estado"
              >
                <Select.Trigger bg="brand.bgMain" border="1px solid" borderColor="brand.border" color="brand.textMain" borderRadius="lg">
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
                ID Comprador
              </label>
              <Input
                id="filtro-comprador"
                type="number"
                placeholder="Ej: 3"
                value={filters.compradorId}
                onChange={(e) => setFilters(prev => ({ ...prev, compradorId: e.target.value }))}
                bg="brand.bgMain"
                border="1px solid"
                borderColor="brand.border"
                color="brand.textMain"
                size="sm"
                borderRadius="lg"
                min={1}
                _focus={{ borderColor: 'brand.accent', outline: 'none' }}
              />
            </VStack>

            <VStack align="start" gap={1}>
              <label htmlFor="filtro-desde" style={{ fontSize: '12px', color: 'var(--chakra-colors-brand-textMuted)', display: 'block' }}>
                Fecha desde
              </label>
              <Input
                id="filtro-desde"
                type="date"
                value={filters.fechaDesde}
                onChange={(e) => setFilters(prev => ({ ...prev, fechaDesde: e.target.value }))}
                bg="brand.bgMain"
                border="1px solid"
                borderColor="brand.border"
                color="brand.textMain"
                size="sm"
                borderRadius="lg"
                _focus={{ borderColor: 'brand.accent', outline: 'none' }}
              />
            </VStack>

            <VStack align="start" gap={1}>
              <label htmlFor="filtro-hasta" style={{ fontSize: '12px', color: 'var(--chakra-colors-brand-textMuted)', display: 'block' }}>
                Fecha hasta
              </label>
              <Input
                id="filtro-hasta"
                type="date"
                value={filters.fechaHasta}
                onChange={(e) => setFilters(prev => ({ ...prev, fechaHasta: e.target.value }))}
                bg="brand.bgMain"
                border="1px solid"
                borderColor="brand.border"
                color="brand.textMain"
                size="sm"
                borderRadius="lg"
                _focus={{ borderColor: 'brand.accent', outline: 'none' }}
              />
            </VStack>
          </Grid>
        )}

        {filtersOpen && (
          <Flex gap={3} justify="flex-end">
            {hasActiveFilters && (
              <Box
                as="button"
                px={4} py={2}
                border="1px solid" borderColor="brand.border"
                borderRadius="lg" color="brand.textMuted" fontSize="sm"
                transition="all 0.2s"
                _hover={{ borderColor: 'brand.accent', color: 'brand.accent' }}
                onClick={handleClearFilters}
                aria-label="Limpiar todos los filtros"
              >
                Limpiar
              </Box>
            )}
            <Box
              as="button"
              px={5} py={2}
              bg="brand.accent" color="brand.bgMain"
              borderRadius="lg" fontSize="sm" fontWeight="bold"
              transition="all 0.2s"
              _hover={{ opacity: 0.85 }}
              onClick={handleApplyFilters}
              aria-label="Aplicar filtros"
            >
              Aplicar filtros
            </Box>
          </Flex>
        )}
      </Box>

      {/* Tabla de pedidos */}
      <Box
        bg="brand.bgCard"
        border="1px solid"
        borderColor="brand.border"
        borderRadius="xl"
        overflow="hidden"
        as="section"
        aria-label="Listado de pedidos"
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
              as="button"
              px={5} py={2}
              border="1px solid" borderColor="brand.border"
              borderRadius="lg" color="brand.textMain" fontSize="sm"
              _hover={{ borderColor: 'brand.accent', color: 'brand.accent' }}
              onClick={() => fetchPedidos(applied, offset)}
              aria-label="Reintentar carga de pedidos"
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
          <Box overflowX="auto" role="region" aria-label="Tabla de pedidos, desplazable horizontalmente">
            <Box as="table" w="full" role="table" aria-label="Listado de pedidos del sistema">
              <Box as="thead" role="rowgroup">
                <Box as="tr" role="row" borderBottom="1px solid" borderColor="brand.border">
                  {['#', 'Comprador', 'Fecha', 'Estado', 'Productos', 'Monto'].map((col) => (
                    <Box
                      as="th"
                      key={col}
                      role="columnheader"
                      px={4} py={3}
                      fontSize="xs"
                      color="brand.textMuted"
                      textTransform="uppercase"
                      letterSpacing="wider"
                      textAlign={col === 'Monto' ? 'right' : col === 'Productos' ? 'center' : 'left'}
                      fontWeight="semibold"
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

      {/* Paginador */}
      {total > LIMIT && (
        <PaginationAdmin
          totalItems={total}
          limit={LIMIT}
          offset={offset}
          onPageChange={handlePageChange}
        />
      )}

    </Container>
  )
}