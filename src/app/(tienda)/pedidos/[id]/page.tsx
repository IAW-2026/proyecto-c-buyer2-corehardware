'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import {
  Box, Container, Flex, Grid, Heading, Text,
  VStack, HStack, Spinner, Icon, Image,
} from '@chakra-ui/react'
import {
  FaClock, FaCheckCircle, FaTimesCircle, FaTruck,
  FaExclamationCircle, FaTools, FaBox, FaMapMarkerAlt,
  FaCalendarAlt, FaChevronRight,
} from 'react-icons/fa'
import AppNavbar from '@/components/AppNavbar'
import { BackButton } from '@/components/ui/BackButton'
import { SellerService } from '@/services/sellerService'
import { ShipmentService, Shipment } from '@/services/shipmentService'
import { Pedido, EstadoPedido } from '@/types/pedido'
import { ProductSummary } from '@/types/producto'

// ── Tipos ──────────────────────────────────────────────────────────────────

interface ProductoConCantidad extends ProductSummary {
  cantidad: number
}

// ── Config de estados de pedido ────────────────────────────────────────────

const ESTADO_CONFIG: Record<EstadoPedido, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  PENDIENTE_PAGO:  { label: 'Pendiente de pago',  color: '#F0A500', bg: 'rgba(240,165,0,0.12)',    icon: FaClock },
  PAGO_APROBADO:   { label: 'Pago aprobado',       color: '#00D1FF', bg: 'rgba(0,209,255,0.12)',    icon: FaCheckCircle },
  PAGO_RECHAZADO:  { label: 'Pago rechazado',      color: '#F85149', bg: 'rgba(248,81,73,0.12)',    icon: FaTimesCircle },
  EN_PREPARACION:  { label: 'En preparación',      color: '#A78BFA', bg: 'rgba(167,139,250,0.12)',  icon: FaTools },
  EN_CAMINO:       { label: 'En camino',            color: '#34D399', bg: 'rgba(52,211,153,0.12)',   icon: FaTruck },
  ENTREGADO:       { label: 'Entregado',            color: '#34D399', bg: 'rgba(52,211,153,0.12)',   icon: FaCheckCircle },
  CANCELADO:       { label: 'Cancelado',            color: '#8B949E', bg: 'rgba(139,148,158,0.12)',  icon: FaTimesCircle },
}

const PASOS_FLUJO: EstadoPedido[] = [
  'PENDIENTE_PAGO',
  'PAGO_APROBADO',
  'EN_PREPARACION',
  'EN_CAMINO',
  'ENTREGADO',
]

const ENVIO_ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending:   { label: 'Pendiente',  color: '#F0A500', bg: 'rgba(240,165,0,0.12)',   icon: FaClock },
  en_camino: { label: 'En camino',  color: '#34D399', bg: 'rgba(52,211,153,0.12)',  icon: FaTruck },
  entregado: { label: 'Entregado',  color: '#00D1FF', bg: 'rgba(0,209,255,0.12)',   icon: FaCheckCircle },
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatFechaCorta(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

function formatMonto(monto: number): string {
  return monto.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

function agruparProductos(ids: number[]): { id: number; cantidad: number }[] {
  const map = new Map<number, number>()
  for (const id of ids) map.set(id, (map.get(id) ?? 0) + 1)
  return Array.from(map.entries()).map(([id, cantidad]) => ({ id, cantidad }))
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
      onBlur={(e) => { e.currentTarget.style.left = '-9999px' }}
    >
      Ir al contenido principal
    </a>
  )
}

// ── BarraProgreso ──────────────────────────────────────────────────────────

function BarraProgreso({ estado }: { estado: EstadoPedido }) {
  const config = ESTADO_CONFIG[estado]

  if (estado === 'PAGO_RECHAZADO' || estado === 'CANCELADO') {
    return (
      <HStack
        gap={3}
        p={4}
        bg={config.bg}
        border="1px solid"
        borderColor={config.color}
        borderRadius="xl"
        role="status"
        aria-label={`Estado del pedido: ${config.label}`}
      >
        <Icon as={config.icon} color={config.color} boxSize={4} aria-hidden="true" />
        <Text fontWeight="semibold" color={config.color} fontSize="sm">{config.label}</Text>
      </HStack>
    )
  }

  const pasoActual = PASOS_FLUJO.indexOf(estado)

  return (
    <Box
      role="status"
      aria-label={`Estado del pedido: ${config.label}. Paso ${pasoActual + 1} de ${PASOS_FLUJO.length}`}
    >
      <Flex align="center" gap={0}>
        {PASOS_FLUJO.map((paso, i) => {
          const cfg = ESTADO_CONFIG[paso]
          const completado = i < pasoActual
          const activo = i === pasoActual

          return (
            <Flex key={paso} align="center" flex={i < PASOS_FLUJO.length - 1 ? 1 : 'none'}>
              <VStack gap={1} minW="60px" align="center">
                <Flex
                  w="32px" h="32px"
                  borderRadius="full"
                  bg={activo || completado ? cfg.bg : 'transparent'}
                  border="2px solid"
                  borderColor={activo || completado ? cfg.color : 'brand.border'}
                  align="center"
                  justify="center"
                  transition="all 0.3s"
                  aria-hidden="true"
                >
                  <Icon
                    as={cfg.icon}
                    boxSize={3.5}
                    color={activo || completado ? cfg.color : 'brand.textMuted'}
                  />
                </Flex>
                <Text
                  fontSize="9px"
                  textAlign="center"
                  color={activo ? cfg.color : 'brand.textMuted'}
                  fontWeight={activo ? 'bold' : 'normal'}
                  lineHeight={1.2}
                  maxW="55px"
                  aria-hidden="true"
                >
                  {cfg.label}
                </Text>
              </VStack>

              {i < PASOS_FLUJO.length - 1 && (
                <Box
                  flex={1}
                  h="2px"
                  bg={completado ? cfg.color : 'brand.border'}
                  mx={1}
                  mb={5}
                  transition="background 0.3s"
                  aria-hidden="true"
                />
              )}
            </Flex>
          )
        })}
      </Flex>
    </Box>
  )
}

// ── ProductoRow ────────────────────────────────────────────────────────────

function ProductoRow({ producto }: { producto: ProductoConCantidad }) {
  return (
    <Flex
      align="center"
      gap={4}
      py={3}
      borderBottom="1px solid"
      borderColor="brand.border"
      _last={{ borderBottom: 'none' }}
      as="li"
      aria-label={`${producto.nombre}, cantidad ${producto.cantidad}, total ${formatMonto(producto.precio * producto.cantidad)}`}
    >
      <Image
        src={producto.imagen || 'https://via.placeholder.com/56'}
        alt={`Imagen de ${producto.nombre}`}
        boxSize="56px"
        objectFit="contain"
        borderRadius="md"
        bg="white"
        p={1}
        border="1px solid"
        borderColor="brand.border"
        flexShrink={0}
      />
      <Box flex={1} minW={0}>
        <Text
          fontSize="sm"
          fontWeight="medium"
          color="brand.textMain"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          {producto.nombre}
        </Text>
        <Text fontSize="xs" color="brand.textMuted" mt={0.5}>
          {producto.marca} · x{producto.cantidad}
        </Text>
      </Box>
      <VStack align="end" gap={0} flexShrink={0}>
        <Text fontSize="sm" fontWeight="semibold" color="brand.textMain" aria-hidden="true">
          {formatMonto(producto.precio * producto.cantidad)}
        </Text>
        {producto.cantidad > 1 && (
          <Text fontSize="xs" color="brand.textMuted" aria-hidden="true">
            {formatMonto(producto.precio)} c/u
          </Text>
        )}
      </VStack>
    </Flex>
  )
}

// ── SeguimientoSection ─────────────────────────────────────────────────────

interface SeguimientoSectionProps {
  envioId: number
  onVerDetalle: () => void
}

function SeguimientoSection({ envioId, onVerDetalle }: SeguimientoSectionProps) {
  const [envio, setEnvio] = useState<Shipment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    ShipmentService.getShipmentById(envioId)
      .then((data) => { setEnvio(data); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [envioId])

  const envioConfig = envio
    ? (ENVIO_ESTADO_CONFIG[envio.estado] ?? ENVIO_ESTADO_CONFIG.pending)
    : null

  return (
    <Box
      bg="brand.bgCard"
      border="1px solid"
      borderColor="brand.border"
      borderRadius="xl"
      p={5}
      mb={4}
      as="section"
      aria-labelledby="seguimiento-heading"
    >
      <Flex justify="space-between" align="center" mb={4}>
        <Text
          id="seguimiento-heading"
          fontSize="xs"
          color="brand.textMuted"
          textTransform="uppercase"
          letterSpacing="wider"
        >
          Seguimiento del envío
        </Text>
        <Text fontSize="xs" color="brand.textMuted" fontFamily="mono">
          #{envioId}
        </Text>
      </Flex>

      {loading ? (
        <Flex justify="center" py={4} role="status" aria-label="Cargando datos del envío">
          <Spinner color="brand.accent" size="sm" />
        </Flex>
      ) : error || !envio ? (
        <Text fontSize="sm" color="brand.textMuted" role="alert">
          No pudimos cargar los datos del envío.
        </Text>
      ) : (
        <>
          <Flex align="center" gap={3} mb={4}>
            <Flex
              w="40px" h="40px"
              borderRadius="full"
              bg={envioConfig!.bg}
              border="1px solid"
              borderColor={envioConfig!.color}
              align="center"
              justify="center"
              flexShrink={0}
              aria-hidden="true"
            >
              <Icon as={envioConfig!.icon} color={envioConfig!.color} boxSize={4} />
            </Flex>
            <VStack align="start" gap={0}>
              <Text fontSize="sm" fontWeight="semibold" color={envioConfig!.color}>
                {envioConfig!.label}
              </Text>
              <Text fontSize="xs" color="brand.textMuted">Estado actual del envío</Text>
            </VStack>
          </Flex>

          <Grid templateColumns="1fr 1fr" gap={3} mb={4}>
            <VStack align="start" gap={0}>
              <Flex align="center" gap={1.5} mb={0.5}>
                <Icon as={FaCalendarAlt} boxSize={3} color="brand.textMuted" aria-hidden="true" />
                <Text fontSize="xs" color="brand.textMuted">Entrega estimada</Text>
              </Flex>
              <Text fontSize="sm" color="brand.textMain" fontWeight="medium">
                <time dateTime={envio.fecha_de_entrega}>
                  {formatFechaCorta(envio.fecha_de_entrega)}
                </time>
              </Text>
            </VStack>
            <VStack align="start" gap={0}>
              <Flex align="center" gap={1.5} mb={0.5}>
                <Icon as={FaMapMarkerAlt} boxSize={3} color="brand.textMuted" aria-hidden="true" />
                <Text fontSize="xs" color="brand.textMuted">Dirección</Text>
              </Flex>
              <Text
                fontSize="sm"
                color="brand.textMain"
                fontWeight="medium"
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                title={envio.direccion}
              >
                {envio.direccion}
              </Text>
            </VStack>
          </Grid>

          <Box
            as="button"
            w="full"
            py={2.5}
            px={4}
            borderRadius="lg"
            border="1px solid"
            borderColor="brand.border"
            color="brand.textMuted"
            fontSize="sm"
            transition="all 0.2s"
            _hover={{ borderColor: 'brand.accent', color: 'brand.accent', bg: 'rgba(0,209,255,0.04)' }}
            _focus={{ outline: '2px solid', outlineColor: 'brand.accent', outlineOffset: '2px' }}
            onClick={onVerDetalle}
            aria-label={`Ver seguimiento detallado del envío número ${envioId}`}
          >
            <Flex align="center" justify="space-between">
              <Flex align="center" gap={2}>
                <Icon as={FaTruck} boxSize={3.5} aria-hidden="true" />
                <Text>Ver seguimiento completo</Text>
              </Flex>
              <Icon as={FaChevronRight} boxSize={3} aria-hidden="true" />
            </Flex>
          </Box>
        </>
      )}
    </Box>
  )
}

// ── Página principal ───────────────────────────────────────────────────────

export default function PedidoDetallePage() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [productos, setProductos] = useState<ProductoConCantidad[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingProductos, setLoadingProductos] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      router.push(`/sign-in?redirectUrl=/pedidos/${id}`)
      return
    }

    const fetchPedido = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/orders/${id}`)
        if (res.status === 403 || res.status === 404) {
          setError('Pedido no encontrado.')
          return
        }
        if (!res.ok) throw new Error('Error al cargar el pedido')
        const data: Pedido = await res.json()
        setPedido(data)

        setLoadingProductos(true)
        const agrupados = agruparProductos(data.productos)
        const idsUnicos = [...new Set(data.productos)]

        const resultados = await Promise.all(
          idsUnicos.map((pid) => SellerService.getProductById(pid))
        )

        const productosConCantidad: ProductoConCantidad[] = resultados
          .filter((p): p is NonNullable<typeof p> => p !== null)
          .map((p) => ({
            ...p,
            cantidad: agrupados.find((a) => a.id === p.id)?.cantidad ?? 1,
          }))

        setProductos(productosConCantidad)
      } catch {
        setError('No pudimos cargar el pedido. Intentá de nuevo.')
      } finally {
        setLoading(false)
        setLoadingProductos(false)
      }
    }

    fetchPedido()
  }, [isLoaded, isSignedIn, id, router])

  if (!isLoaded || loading) {
    return (
      <>
        <AppNavbar />
        <Flex
          justify="center"
          align="center"
          minH="60vh"
          role="status"
          aria-label="Cargando pedido"
        >
          <Spinner color="brand.accent" size="lg" />
        </Flex>
      </>
    )
  }

  if (error || !pedido) {
    return (
      <>
        <AppNavbar />
        <Container maxW="container.md" py={8}>
          <Flex direction="column" align="center" gap={4} role="alert" aria-live="assertive">
            <Icon as={FaExclamationCircle} boxSize={10} color="brand.danger" aria-hidden="true" />
            <Text color="brand.textMuted">{error ?? 'Pedido no encontrado.'}</Text>
            <Box
              as="button"
              px={5} py={2}
              border="1px solid" borderColor="brand.border"
              borderRadius="lg" color="brand.textMain" fontSize="sm"
              _hover={{ borderColor: 'brand.accent', color: 'brand.accent' }}
              _focus={{ outline: '2px solid', outlineColor: 'brand.accent', outlineOffset: '2px' }}
              onClick={() => router.push('/pedidos')}
            >
              Volver a mis pedidos
            </Box>
          </Flex>
        </Container>
      </>
    )
  }

  const config = ESTADO_CONFIG[pedido.estado]

  return (
    <>
      <AppNavbar />
      <Container maxW="container.md" py={8} px={{ base: 4, md: 6 }}>
        <SkipLink />
        <main id="main-content">
          {/* Encabezado */}
          <Flex align="center" gap={3} mb={6}>
            <BackButton />
            <VStack align="start" gap={0}>
              <Text fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider">
                Detalle del pedido
              </Text>
              <Heading as="h1" size="lg" color="brand.textMain" fontFamily="mono">
                #{pedido.id}
              </Heading>
            </VStack>

            <HStack
              ml="auto"
              px={3} py={1}
              borderRadius="full"
              bg={config.bg}
              border="1px solid"
              borderColor={config.color}
              gap={1.5}
              flexShrink={0}
              role="status"
              aria-label={`Estado del pedido: ${config.label}`}
            >
              <Icon as={config.icon} color={config.color} boxSize={3} aria-hidden="true" />
              <Text fontSize="xs" fontWeight="semibold" color={config.color}>{config.label}</Text>
            </HStack>
          </Flex>

          {/* Barra de progreso */}
          <Box
            bg="brand.bgCard"
            border="1px solid"
            borderColor="brand.border"
            borderRadius="xl"
            p={5}
            mb={4}
          >
            <Text
              fontSize="xs"
              color="brand.textMuted"
              textTransform="uppercase"
              letterSpacing="wider"
              mb={4}
            >
              Progreso del pedido
            </Text>
            <BarraProgreso estado={pedido.estado} />
          </Box>

          {/* Productos */}
          <Box
            as="section"
            aria-labelledby="productos-heading"
            bg="brand.bgCard"
            border="1px solid"
            borderColor="brand.border"
            borderRadius="xl"
            p={5}
            mb={4}
          >
            <Text
              id="productos-heading"
              fontSize="xs"
              color="brand.textMuted"
              textTransform="uppercase"
              letterSpacing="wider"
              mb={3}
            >
              Productos
            </Text>

            {loadingProductos ? (
              <Flex justify="center" py={6} role="status" aria-label="Cargando productos">
                <Spinner color="brand.accent" size="sm" />
              </Flex>
            ) : productos.length > 0 ? (
              <Box
                as="ul"
                listStyleType="none"
                role="list"
                aria-label="Lista de productos del pedido"
              >
                {productos.map((p) => (
                  <ProductoRow key={p.id} producto={p} />
                ))}
              </Box>
            ) : (
              <Flex align="center" gap={2} py={4} color="brand.textMuted" role="status">
                <Icon as={FaBox} aria-hidden="true" />
                <Text fontSize="sm">{pedido.productos.length} producto(s) — detalle no disponible</Text>
              </Flex>
            )}

            <Flex
              justify="space-between"
              align="center"
              pt={4}
              mt={2}
              borderTop="1px solid"
              borderColor="brand.border"
            >
              <Text fontSize="sm" color="brand.textMuted" fontWeight="medium">Total del pedido</Text>
              <Text
                fontSize="2xl"
                fontWeight="black"
                color="brand.accent"
                aria-label={`Total: ${formatMonto(pedido.monto)}`}
              >
                {formatMonto(pedido.monto)}
              </Text>
            </Flex>
          </Box>

          {/* Info del pedido */}
          <Box
            as="section"
            aria-labelledby="info-heading"
            bg="brand.bgCard"
            border="1px solid"
            borderColor="brand.border"
            borderRadius="xl"
            p={5}
            mb={4}
          >
            <Text
              id="info-heading"
              fontSize="xs"
              color="brand.textMuted"
              textTransform="uppercase"
              letterSpacing="wider"
              mb={3}
            >
              Información del pedido
            </Text>
            <Grid templateColumns="1fr 1fr" gap={4}>
              <VStack align="start" gap={0}>
                <Text fontSize="xs" color="brand.textMuted">Fecha</Text>
                <Text fontSize="sm" color="brand.textMain" fontWeight="medium">
                  <time dateTime={pedido.fecha}>{formatFecha(pedido.fecha)}</time>
                </Text>
              </VStack>
              <VStack align="start" gap={0}>
                <Text fontSize="xs" color="brand.textMuted">Vendedor</Text>
                <Text fontSize="sm" color="brand.textMain" fontWeight="medium">#{pedido.vendedor_id}</Text>
              </VStack>
            </Grid>
          </Box>

          {/* Seguimiento integrado */}
          {pedido.envio_id && (
            <SeguimientoSection
              envioId={pedido.envio_id}
             onVerDetalle={() => router.push(`/seguimiento_envio?pedidoId=${pedido.id}&envioId=${pedido.envio_id}`)}            />
          )}
        </main>
      </Container>
    </>
  )
}