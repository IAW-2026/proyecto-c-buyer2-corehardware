'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import {
  Box, Container, Flex, Grid, Text,
  VStack, HStack, Spinner, Icon,
} from '@chakra-ui/react'
import {
  FaClock, FaCheckCircle, FaTruck,
  FaExclamationCircle, FaMapMarkerAlt, FaCalendarAlt,
  FaBox, FaArrowLeft,
} from 'react-icons/fa'
import AppNavbar from '@/components/AppNavbar'
import { BackButton } from '@/components/ui/BackButton'
import { ShipmentService, Shipment } from '@/services/shipmentService'
import { Pedido, EstadoPedido } from '@/types/pedido'

// ── Config de estados del envío ────────────────────────────────────────────

const ENVIO_PASOS = ['pending', 'en_camino', 'entregado'] as const
type EstadoEnvio = typeof ENVIO_PASOS[number]

const ENVIO_CONFIG: Record<EstadoEnvio, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending:   { label: 'Preparando envío', color: '#F0A500', bg: 'rgba(240,165,0,0.12)',   icon: FaBox },
  en_camino: { label: 'En camino',         color: '#00D1FF', bg: 'rgba(0,209,255,0.12)',   icon: FaTruck },
  entregado: { label: 'Entregado',         color: '#34D399', bg: 'rgba(52,211,153,0.12)',  icon: FaCheckCircle },
}

const ESTADO_PEDIDO_LABEL: Record<EstadoPedido, string> = {
  PENDIENTE_PAGO:  'Pendiente de pago',
  PAGO_APROBADO:   'Pago aprobado',
  PAGO_RECHAZADO:  'Pago rechazado',
  EN_PREPARACION:  'En preparación',
  EN_CAMINO:       'En camino',
  ENTREGADO:       'Entregado',
  CANCELADO:       'Cancelado',
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatFechaCorta(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

function formatMonto(monto: number): string {
  return monto.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

// ── Barra de progreso del envío ────────────────────────────────────────────

function BarraEnvio({ estado }: { estado: string }) {
  const pasoActual = ENVIO_PASOS.indexOf(estado as EstadoEnvio)

  return (
    <Flex align="center" gap={0} py={2}>
      {ENVIO_PASOS.map((paso, i) => {
        const cfg = ENVIO_CONFIG[paso]
        const completado = i < pasoActual
        const activo = i === pasoActual

        return (
          <Flex key={paso} align="center" flex={i < ENVIO_PASOS.length - 1 ? 1 : 'none'}>
            <VStack gap={2} minW="80px" align="center">
              <Flex
                w="48px" h="48px"
                borderRadius="full"
                bg={activo || completado ? cfg.bg : 'transparent'}
                border="2px solid"
                borderColor={activo || completado ? cfg.color : 'brand.border'}
                align="center"
                justify="center"
                transition="all 0.3s"
                boxShadow={activo ? `0 0 20px ${cfg.color}33` : 'none'}
              >
                <Icon
                  as={cfg.icon}
                  boxSize={5}
                  color={activo || completado ? cfg.color : 'brand.textMuted'}
                />
              </Flex>
              <Text
                fontSize="11px"
                textAlign="center"
                color={activo ? cfg.color : completado ? 'brand.textMuted' : 'brand.border'}
                fontWeight={activo ? 'bold' : 'normal'}
                lineHeight={1.3}
                maxW="75px"
              >
                {cfg.label}
              </Text>
            </VStack>

            {i < ENVIO_PASOS.length - 1 && (
              <Box
                flex={1}
                h="2px"
                bg={completado ? ENVIO_CONFIG[ENVIO_PASOS[i]].color : 'brand.border'}
                mx={2}
                mb={6}
                transition="background 0.3s"
              />
            )}
          </Flex>
        )
      })}
    </Flex>
  )
}

// ── Página principal ───────────────────────────────────────────────────────

export default function SeguimientoEnvioPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pedidoId = searchParams.get('pedidoId')
  const envioIdParam = searchParams.get('envioId')

  const [envio, setEnvio] = useState<Shipment | null>(null)
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      router.push(`/sign-in?redirectUrl=/seguimiento_envio?pedidoId=${pedidoId}&envioId=${envioIdParam}`)
      return
    }
    if (!envioIdParam) {
      setError('No se especificó un envío.')
      setLoading(false)
      return
    }

    const fetchDatos = async () => {
      setLoading(true)
      setError(null)
      try {
        // Cargamos envío y pedido en paralelo
        const [envioData, pedidoRes] = await Promise.all([
          ShipmentService.getShipmentById(parseInt(envioIdParam)),
          pedidoId ? fetch(`/api/orders/${pedidoId}`) : Promise.resolve(null),
        ])

        if (!envioData) {
          setError('No encontramos los datos del envío.')
          return
        }
        setEnvio(envioData)

        if (pedidoRes && pedidoRes.ok) {
          const pedidoData: Pedido = await pedidoRes.json()
          setPedido(pedidoData)
        }
      } catch {
        setError('No pudimos cargar el seguimiento. Intentá de nuevo.')
      } finally {
        setLoading(false)
      }
    }

    fetchDatos()
  }, [isLoaded, isSignedIn, envioIdParam, pedidoId, router])

  // ── Estados de carga ──

  if (!isLoaded || loading) {
    return (
      <>
        <AppNavbar />
        <Flex justify="center" align="center" minH="60vh" role="status" aria-label="Cargando seguimiento">
          <VStack gap={3}>
            <Spinner color="brand.accent" size="lg" />
            <Text color="brand.textMuted" fontSize="sm">Cargando seguimiento...</Text>
          </VStack>
        </Flex>
      </>
    )
  }

  if (error || !envio) {
    return (
      <>
        <AppNavbar />
        <Container maxW="container.sm" py={8}>
          <Flex direction="column" align="center" gap={4} role="alert">
            <Icon as={FaExclamationCircle} boxSize={10} color="brand.danger" />
            <Text color="brand.textMuted">{error ?? 'Envío no encontrado.'}</Text>
            <Box
              as="button"
              px={5} py={2}
              border="1px solid" borderColor="brand.border"
              borderRadius="lg" color="brand.textMain" fontSize="sm"
              _hover={{ borderColor: 'brand.accent', color: 'brand.accent' }}
              onClick={() => router.push('/pedidos')}
            >
              Volver a mis pedidos
            </Box>
          </Flex>
        </Container>
      </>
    )
  }

  const estadoEnvio = envio.estado as EstadoEnvio
  const cfg = ENVIO_CONFIG[estadoEnvio] ?? ENVIO_CONFIG.pending

  return (
    <>
      <AppNavbar />
      <Container maxW="container.sm" py={8} px={{ base: 4, md: 6 }}>

        {/* Encabezado */}
        <Flex align="center" gap={3} mb={6}>
          <BackButton />
          <VStack align="start" gap={0}>
            <Text fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider">
              Seguimiento del envío
            </Text>
            <Text fontWeight="bold" color="brand.textMain" fontSize="lg" fontFamily="mono">
              #{envio.id}
            </Text>
          </VStack>
        </Flex>

        {/* Estado principal — prominente */}
        <Box
          bg="brand.bgCard"
          border="1px solid"
          borderColor={cfg.color}
          borderRadius="xl"
          p={6}
          mb={4}
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top={0} left={0} right={0}
            h="3px"
            bg={cfg.color}
          />
          <Flex align="center" gap={4} mb={6}>
            <Flex
              w="56px" h="56px"
              borderRadius="full"
              bg={cfg.bg}
              border="2px solid"
              borderColor={cfg.color}
              align="center"
              justify="center"
              flexShrink={0}
              boxShadow={`0 0 24px ${cfg.color}33`}
            >
              <Icon as={cfg.icon} color={cfg.color} boxSize={6} />
            </Flex>
            <VStack align="start" gap={0}>
              <Text fontSize="xl" fontWeight="black" color={cfg.color}>
                {cfg.label}
              </Text>
              <Text fontSize="sm" color="brand.textMuted">Estado actual del envío</Text>
            </VStack>
          </Flex>

          {/* Barra de progreso */}
          <BarraEnvio estado={envio.estado} />
        </Box>

        {/* Datos del envío */}
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
            Detalles del envío
          </Text>

          <Grid templateColumns="1fr 1fr" gap={4}>
            <VStack align="start" gap={0}>
              <Flex align="center" gap={1.5} mb={1}>
                <Icon as={FaCalendarAlt} boxSize={3} color="brand.textMuted" />
                <Text fontSize="xs" color="brand.textMuted">Entrega estimada</Text>
              </Flex>
              <Text fontSize="sm" color="brand.textMain" fontWeight="semibold">
                <time dateTime={envio.fecha_de_entrega}>
                  {formatFechaCorta(envio.fecha_de_entrega)}
                </time>
              </Text>
            </VStack>

            <VStack align="start" gap={0}>
              <Flex align="center" gap={1.5} mb={1}>
                <Icon as={FaBox} boxSize={3} color="brand.textMuted" />
                <Text fontSize="xs" color="brand.textMuted">Monto total</Text>
              </Flex>
              <Text fontSize="sm" color="brand.accent" fontWeight="bold">
                {formatMonto(envio.monto)}
              </Text>
            </VStack>

            <VStack align="start" gap={0} gridColumn="1 / -1">
              <Flex align="center" gap={1.5} mb={1}>
                <Icon as={FaMapMarkerAlt} boxSize={3} color="brand.textMuted" />
                <Text fontSize="xs" color="brand.textMuted">Dirección de entrega</Text>
              </Flex>
              <Text fontSize="sm" color="brand.textMain" fontWeight="medium">
                {envio.direccion}
              </Text>
            </VStack>
          </Grid>
        </Box>

        {/* Resumen del pedido — secundario */}
        {pedido && (
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
              Pedido asociado
            </Text>

            <Grid templateColumns="1fr 1fr" gap={3}>
              <VStack align="start" gap={0}>
                <Text fontSize="xs" color="brand.textMuted">Número</Text>
                <Text fontSize="sm" color="brand.textMain" fontWeight="medium" fontFamily="mono">
                  #{pedido.id}
                </Text>
              </VStack>
              <VStack align="start" gap={0}>
                <Text fontSize="xs" color="brand.textMuted">Estado del pago</Text>
                <Text fontSize="sm" color="brand.textMain" fontWeight="medium">
                  {ESTADO_PEDIDO_LABEL[pedido.estado]}
                </Text>
              </VStack>
              <VStack align="start" gap={0}>
                <Text fontSize="xs" color="brand.textMuted">Productos</Text>
                <Text fontSize="sm" color="brand.textMain" fontWeight="medium">
                  {pedido.productos.length} {pedido.productos.length === 1 ? 'artículo' : 'artículos'}
                </Text>
              </VStack>
              <VStack align="start" gap={0}>
                <Text fontSize="xs" color="brand.textMuted">Monto</Text>
                <Text fontSize="sm" color="brand.textMain" fontWeight="medium">
                  {formatMonto(pedido.monto)}
                </Text>
              </VStack>
            </Grid>

            {/* Link al detalle del pedido */}
            <Box
              as="button"
              mt={4}
              w="full"
              py={2.5}
              px={4}
              borderRadius="lg"
              border="1px solid"
              borderColor="brand.border"
              color="brand.textMuted"
              fontSize="sm"
              transition="all 0.2s"
              _hover={{ borderColor: 'brand.accent', color: 'brand.accent' }}
              onClick={() => router.push(`/pedidos/${pedido.id}`)}
            >
              <Flex align="center" justify="center" gap={2}>
                <Icon as={FaArrowLeft} boxSize={3} />
                <Text>Ver detalle completo del pedido</Text>
              </Flex>
            </Box>
          </Box>
        )}

      </Container>
    </>
  )
}