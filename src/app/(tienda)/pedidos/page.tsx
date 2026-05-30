'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import {
  Box, Container, Flex, Grid, Heading, Text,
  VStack, HStack, Spinner, Icon,
} from '@chakra-ui/react'
import {
  FaClock, FaCheckCircle, FaTimesCircle, FaTruck,
  FaExclamationCircle, FaTools, FaShoppingBag, FaArrowRight,
} from 'react-icons/fa'
import AppNavbar from '@/components/AppNavbar'
import { BackButton } from '@/components/ui/BackButton'
import Pagination from '@/components/Pagination'
import { Pedido, PedidosResponse, EstadoPedido } from '@/types/pedido'

// ── Config de estados ──────────────────────────────────────────────────────

const ESTADO_CONFIG: Record<EstadoPedido, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  PENDIENTE_PAGO:  { label: 'Pendiente de pago',  color: '#F0A500', bg: 'rgba(240,165,0,0.12)',    icon: FaClock },
  PAGO_APROBADO:   { label: 'Pago aprobado',       color: '#00D1FF', bg: 'rgba(0,209,255,0.12)',    icon: FaCheckCircle },
  PAGO_RECHAZADO:  { label: 'Pago rechazado',      color: '#F85149', bg: 'rgba(248,81,73,0.12)',    icon: FaTimesCircle },
  EN_PREPARACION:  { label: 'En preparación',      color: '#A78BFA', bg: 'rgba(167,139,250,0.12)',  icon: FaTools },
  EN_CAMINO:       { label: 'En camino',            color: '#34D399', bg: 'rgba(52,211,153,0.12)',   icon: FaTruck },
  ENTREGADO:       { label: 'Entregado',            color: '#34D399', bg: 'rgba(52,211,153,0.12)',   icon: FaCheckCircle },
  CANCELADO:       { label: 'Cancelado',            color: '#8B949E', bg: 'rgba(139,148,158,0.12)',  icon: FaTimesCircle },
}

const LIMIT = 8

// ── Helpers ────────────────────────────────────────────────────────────────

function formatFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatMonto(monto: number): string {
  return monto.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

// ── SkipLink ───────────────────────────────────────────────────────────────

function SkipLink() {
  return (
    <a
      href="#main-content"
      style={{ position: 'absolute', left: '-9999px', top: 'auto', zIndex: 9999 }}
      onFocus={(e) => {
        Object.assign(e.currentTarget.style, {
          left: '1rem',
          top: '1rem',
          background: 'var(--chakra-colors-brand-accent)',
          color: 'var(--chakra-colors-brand-bgMain)',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          fontWeight: '600',
          fontSize: '0.875rem',
          textDecoration: 'none',
        })
      }}
      onBlur={(e) => {
        e.currentTarget.style.left = '-9999px'
      }}
    >
      Ir al contenido principal
    </a>
  )
}

// ── PedidoCard ─────────────────────────────────────────────────────────────

function PedidoCard({ pedido }: { pedido: Pedido }) {
  const router = useRouter()
  const config = ESTADO_CONFIG[pedido.estado]
  const cantidadProductos = pedido.productos.length
  const montoFormateado = formatMonto(pedido.monto)

  const handleNavigate = () => router.push(`/pedidos/${pedido.id}`)

  return (
    <Box
      as="article"
      aria-label={`Pedido número ${pedido.id}, estado ${config.label}, total ${montoFormateado}`}
      bg="brand.bgCard"
      border="1px solid"
      borderColor="brand.border"
      borderRadius="xl"
      p={5}
      cursor="pointer"
      transition="all 0.2s"
      _hover={{ borderColor: 'brand.accent', transform: 'translateY(-2px)', boxShadow: '0 8px 30px rgba(0,209,255,0.08)' }}
      _focusWithin={{ borderColor: 'brand.accent', boxShadow: '0 0 0 2px rgba(0,209,255,0.4)' }}
      onClick={handleNavigate}
      position="relative"
      overflow="hidden"
    >
      {/* Línea de acento superior según estado */}
      <Box position="absolute" top={0} left={0} right={0} h="2px" bg={config.color} opacity={0.7} aria-hidden="true" />

      {/* Cabecera */}
      <Flex justify="space-between" align="flex-start" mb={4}>
        <VStack align="start" gap={0}>
          <Text fontSize="xs" color="brand.textMuted" letterSpacing="wider" textTransform="uppercase" aria-hidden="true">
            Pedido
          </Text>
          <Text fontWeight="bold" color="brand.textMain" fontSize="lg" fontFamily="mono">
            #{pedido.id}
          </Text>
        </VStack>

        <HStack
          px={3} py={1} borderRadius="full"
          bg={config.bg} border="1px solid" borderColor={config.color}
          gap={1.5}
        >
          <Icon as={config.icon} color={config.color} boxSize={3} aria-hidden="true" />
          <Text fontSize="xs" fontWeight="semibold" color={config.color}>{config.label}</Text>
        </HStack>
      </Flex>

      {/* Info */}
      <Grid templateColumns="1fr 1fr" gap={3} mb={4}>
        <VStack align="start" gap={0}>
          <Text fontSize="xs" color="brand.textMuted" id={`fecha-label-${pedido.id}`}>Fecha</Text>
          <Text fontSize="sm" color="brand.textMain" fontWeight="medium">
            <time dateTime={pedido.fecha} aria-labelledby={`fecha-label-${pedido.id}`}>
              {formatFecha(pedido.fecha)}
            </time>
          </Text>
        </VStack>
        <VStack align="start" gap={0}>
          <Text fontSize="xs" color="brand.textMuted">Productos</Text>
          <Text fontSize="sm" color="brand.textMain" fontWeight="medium">
            {cantidadProductos} {cantidadProductos === 1 ? 'artículo' : 'artículos'}
          </Text>
        </VStack>
        <VStack align="start" gap={0}>
          <Text fontSize="xs" color="brand.textMuted">Envío</Text>
          <Text fontSize="sm" color={pedido.envio_id ? 'brand.accent' : 'brand.textMuted'} fontWeight="medium">
            {pedido.envio_id ? `#${pedido.envio_id}` : '—'}
          </Text>
        </VStack>
        <VStack align="start" gap={0}>
          <Text fontSize="xs" color="brand.textMuted">Vendedor</Text>
          <Text fontSize="sm" color="brand.textMain" fontWeight="medium">#{pedido.vendedor_id}</Text>
        </VStack>
      </Grid>

      {/* Footer */}
      <Flex justify="space-between" align="center" pt={3} borderTop="1px solid" borderColor="brand.border">
        <Box
          role="link"
          tabIndex={0}
          display="flex"
          alignItems="center"
          gap="6px"
          color="brand.textMuted"
          fontSize="xs"
          cursor="pointer"
          _focus={{ outline: '2px solid', outlineColor: 'brand.accent', outlineOffset: '2px', borderRadius: 'sm' }}
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleNavigate() }}
          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') handleNavigate() }}
          aria-label={`Ver detalle del pedido ${pedido.id}`}
        >
          <Icon as={FaArrowRight} boxSize={3} aria-hidden="true" />
          <Text>Ver detalle</Text>
        </Box>
        <Text fontSize="xl" fontWeight="black" color="brand.accent" aria-hidden="true">
          {montoFormateado}
        </Text>
      </Flex>
    </Box>
  )
}

// ── EmptyState ─────────────────────────────────────────────────────────────

function EmptyState() {
  const router = useRouter()
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      py={20}
      gap={4}
      role="status"
      aria-label="No tenés pedidos aún"
    >
      <Box
        p={6}
        borderRadius="full"
        bg="rgba(0,209,255,0.08)"
        border="1px solid"
        borderColor="brand.border"
        aria-hidden="true"
      >
        <Icon as={FaShoppingBag} boxSize={10} color="brand.textMuted" />
      </Box>
      <VStack gap={1}>
        <Text fontSize="xl" fontWeight="bold" color="brand.textMain">
          Todavía no tenés pedidos
        </Text>
        <Text color="brand.textMuted" textAlign="center" maxW="300px">
          Explorá el catálogo y hacé tu primera compra en CoreHardware
        </Text>
      </VStack>
      <Box
        as="button"
        px={6} py={3}
        bg="brand.accent"
        color="brand.bgMain"
        borderRadius="lg"
        fontWeight="bold"
        fontSize="sm"
        transition="all 0.2s"
        _hover={{ opacity: 0.85, transform: 'translateY(-1px)' }}
        _focus={{ outline: '2px solid', outlineColor: 'brand.accent', outlineOffset: '2px' }}
        onClick={() => router.push('/productos')}
        aria-label="Ir al catálogo de productos"
      >
        Ver catálogo
      </Box>
    </Flex>
  )
}

// ── ErrorState ─────────────────────────────────────────────────────────────

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="40vh"
      gap={4}
      role="alert"
      aria-live="assertive"
    >
      <Icon as={FaExclamationCircle} boxSize={10} color="brand.danger" aria-hidden="true" />
      <Text color="brand.textMuted">{error}</Text>
      <Box
        as="button"
        px={5} py={2}
        border="1px solid" borderColor="brand.border"
        borderRadius="lg" color="brand.textMain" fontSize="sm"
        _hover={{ borderColor: 'brand.accent', color: 'brand.accent' }}
        _focus={{ outline: '2px solid', outlineColor: 'brand.accent', outlineOffset: '2px' }}
        onClick={onRetry}
        aria-label="Reintentar cargar los pedidos"
      >
        Reintentar
      </Box>
    </Flex>
  )
}

// ── Página principal ───────────────────────────────────────────────────────

export default function PedidosPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()

  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPedidos = useCallback(async (newOffset: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/orders?limit=${LIMIT}&offset=${newOffset}`)
      if (!res.ok) throw new Error('Error al cargar los pedidos')
      const data: PedidosResponse = await res.json()
      setPedidos(data.items)
      setTotal(data.total)
    } catch {
      setError('No pudimos cargar tus pedidos. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      router.push('/sign-in?redirectUrl=/pedidos')
      return
    }
    fetchPedidos(offset)
  }, [isLoaded, isSignedIn, offset, fetchPedidos, router])

  const handlePageChange = (newOffset: number) => {
    setOffset(newOffset)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!isLoaded) {
    return (
      <>
        <AppNavbar />
        <Flex
          justify="center"
          align="center"
          minH="60vh"
          role="status"
          aria-label="Verificando sesión"
        >
          <Spinner color="brand.accent" size="lg" />
        </Flex>
      </>
    )
  }

  return (
    <>
      <AppNavbar />
      <Container maxW="container.xl" py={8} px={{ base: 4, md: 6 }}>
        <SkipLink />
        <main id="main-content">
          <Flex align="center" gap={3} mb={8}>
            <BackButton />
            <VStack align="start" gap={0}>
              <Heading as="h1" size="xl" color="brand.textMain">Mis Pedidos</Heading>
              {!loading && total > 0 && (
                <Text color="brand.textMuted" fontSize="sm" aria-live="polite">
                  {total} {total === 1 ? 'pedido encontrado' : 'pedidos encontrados'}
                </Text>
              )}
            </VStack>
          </Flex>

          {loading ? (
            <Flex
              justify="center"
              align="center"
              minH="40vh"
              role="status"
              aria-label="Cargando pedidos"
              aria-live="polite"
            >
              <VStack gap={3}>
                <Spinner color="brand.accent" size="lg" />
                <Text color="brand.textMuted" fontSize="sm">Cargando pedidos...</Text>
              </VStack>
            </Flex>

          ) : error ? (
            <ErrorState error={error} onRetry={() => fetchPedidos(offset)} />

          ) : pedidos.length === 0 ? (
            <EmptyState />

          ) : (
            <>
              <Grid
                as="section"
                aria-label={`Lista de pedidos, página ${Math.floor(offset / LIMIT) + 1}`}
                templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }}
                gap={4}
              >
                {pedidos.map((pedido) => (
                  <PedidoCard key={pedido.id} pedido={pedido} />
                ))}
              </Grid>

              {total > LIMIT && (
                <Pagination
                  totalItems={total}
                  limit={LIMIT}
                  offset={offset}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </main>
      </Container>
    </>
  )
}