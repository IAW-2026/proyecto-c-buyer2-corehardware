'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import {
  Box, Container, Flex, Grid, Text,
  VStack, Spinner, Icon,
} from '@chakra-ui/react'
import {
  FaExclamationCircle, FaMapMarkerAlt,
  FaCalendarAlt, FaBox, FaArrowLeft,
} from 'react-icons/fa'
import { BackButton } from '@/components/ui/BackButton'
import { SkipLink } from '@/components/ui/SkipLink'
import { BarraEnvio } from '@/components/seguimiento/BarraEnvio'
import { ShipmentService, Shipment } from '@/services/shipmentService'
import { Pedido } from '@/types/pedido'
import { formatMonto } from '@/utils/pedidoUtils'
import { formatFechaLarga } from '@/utils/formatDate'
import {
  ENVIO_CONFIG, ESTADO_PEDIDO_LABEL, EstadoEnvio
} from '@/utils/seguimientoUtils'

// ── Contenido principal ────────────────────────────────────────────────────

function SeguimientoEnvioContent() {
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

  if (!isLoaded || loading) {
    return (
      <Flex justify="center" align="center" minH="60vh" role="status" aria-label="Cargando seguimiento">
        <VStack gap={3}>
          <Spinner color="brand.accent" size="lg" />
          <Text color="brand.textMuted" fontSize="sm">Cargando seguimiento...</Text>
        </VStack>
      </Flex>
    )
  }

  if (error || !envio) {
    return (
      <Container maxW="container.sm" py={8}>
        <Flex direction="column" align="center" gap={4} role="alert" aria-live="assertive">
          <Icon as={FaExclamationCircle} boxSize={10} color="brand.danger" aria-hidden="true" />
          <Text color="brand.textMuted">{error ?? 'Envío no encontrado.'}</Text>
          <Box
            as="button"
            px={5} py={2}
            border="1px solid" borderColor="brand.border"
            borderRadius="lg" color="brand.textMain" fontSize="sm"
            _hover={{ borderColor: 'brand.accent', color: 'brand.accent' }}
            _focus={{ outline: '2px solid', outlineColor: 'brand.accent', outlineOffset: '2px' }}
            onClick={() => router.push('/pedidos')}
            aria-label="Volver a mis pedidos"
          >
            Volver a mis pedidos
          </Box>
        </Flex>
      </Container>
    )
  }

  const estadoEnvio = envio.estado as EstadoEnvio
  const cfg = ENVIO_CONFIG[estadoEnvio] ?? ENVIO_CONFIG.pending

  return (
    <>
      <SkipLink />
      <Container maxW="container.sm" py={8} px={{ base: 4, md: 6 }}>
        <main id="main-content">

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

          {/* Estado principal */}
          <Box
            bg="brand.bgCard"
            border="1px solid"
            borderColor={cfg.color}
            borderRadius="xl"
            p={6} mb={4}
            position="relative"
            overflow="hidden"
            role="status"
            aria-label={`Estado del envío: ${cfg.label}`}
          >
            <Box position="absolute" top={0} left={0} right={0} h="3px" bg={cfg.color} aria-hidden="true" />
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
                aria-hidden="true"
              >
                <Icon as={cfg.icon} color={cfg.color} boxSize={6} aria-hidden="true" />
              </Flex>
              <VStack align="start" gap={0}>
                <Text fontSize="xl" fontWeight="black" color={cfg.color}>
                  {cfg.label}
                </Text>
                <Text fontSize="sm" color="brand.textMuted">Estado actual del envío</Text>
              </VStack>
            </Flex>
            <BarraEnvio estado={envio.estado} />
          </Box>

          {/* Datos del envío */}
          <Box
            as="section"
            aria-labelledby="detalles-heading"
            bg="brand.bgCard"
            border="1px solid"
            borderColor="brand.border"
            borderRadius="xl"
            p={5} mb={4}
          >
            <Text
              id="detalles-heading"
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
                  <Icon as={FaCalendarAlt} boxSize={3} color="brand.textMuted" aria-hidden="true" />
                  <Text fontSize="xs" color="brand.textMuted">Entrega estimada</Text>
                </Flex>
                <Text fontSize="sm" color="brand.textMain" fontWeight="semibold">
                  <time dateTime={envio.fecha_de_entrega}>
                    {formatFechaLarga(envio.fecha_de_entrega)}
                  </time>
                </Text>
              </VStack>

              <VStack align="start" gap={0}>
                <Flex align="center" gap={1.5} mb={1}>
                  <Icon as={FaBox} boxSize={3} color="brand.textMuted" aria-hidden="true" />
                  <Text fontSize="xs" color="brand.textMuted">Monto total</Text>
                </Flex>
                <Text fontSize="sm" color="brand.accent" fontWeight="bold">
                  {formatMonto(envio.monto)}
                </Text>
              </VStack>

              <VStack align="start" gap={0} gridColumn="1 / -1">
                <Flex align="center" gap={1.5} mb={1}>
                  <Icon as={FaMapMarkerAlt} boxSize={3} color="brand.textMuted" aria-hidden="true" />
                  <Text fontSize="xs" color="brand.textMuted">Dirección de entrega</Text>
                </Flex>
                <Text fontSize="sm" color="brand.textMain" fontWeight="medium">
                  {envio.direccion}
                </Text>
              </VStack>
            </Grid>
          </Box>

          {/* Pedido asociado */}
          {pedido && (
            <Box
              as="section"
              aria-labelledby="pedido-heading"
              bg="brand.bgCard"
              border="1px solid"
              borderColor="brand.border"
              borderRadius="xl"
              p={5} mb={4}
            >
              <Text
                id="pedido-heading"
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

              <Box
                as="button"
                mt={4} w="full" py={2.5} px={4}
                borderRadius="lg"
                border="1px solid" borderColor="brand.border"
                color="brand.textMuted" fontSize="sm"
                transition="all 0.2s"
                _hover={{ borderColor: 'brand.accent', color: 'brand.accent' }}
                _focus={{ outline: '2px solid', outlineColor: 'brand.accent', outlineOffset: '2px' }}
                onClick={() => router.push(`/pedidos/${pedido.id}`)}
                aria-label={`Ver detalle completo del pedido ${pedido.id}`}
              >
                <Flex align="center" justify="center" gap={2}>
                  <Icon as={FaArrowLeft} boxSize={3} aria-hidden="true" />
                  <Text>Ver detalle completo del pedido</Text>
                </Flex>
              </Box>
            </Box>
          )}

        </main>
      </Container>
    </>
  )
}

// ── Entry point ────────────────────────────────────────────────────────────

export default function SeguimientoEnvioPage() {
  return (
    <Suspense fallback={
      <Flex justify="center" align="center" minH="60vh" role="status" aria-label="Cargando página">
        <Spinner color="brand.accent" size="lg" />
      </Flex>
    }>
      <SeguimientoEnvioContent />
    </Suspense>
  )
}