import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Box, Container, Flex, Grid, Text, VStack, Icon } from '@chakra-ui/react'
import { FaExclamationCircle, FaMapMarkerAlt, FaCalendarAlt, FaBox, FaArrowLeft } from 'react-icons/fa'
import { BackButton } from '@/components/ui/BackButton'
import { SkipLink } from '@/components/ui/SkipLink'
import { BarraEnvio } from '@/components/seguimiento/BarraEnvio'
import { Pedido } from '@/types/pedido'
import { formatMonto } from '@/utils/pedidoUtils'
import { formatFechaLarga } from '@/utils/formatDate'
import { ENVIO_CONFIG, ESTADO_PEDIDO_LABEL, EstadoEnvio } from '@/utils/seguimientoUtils'
import { fetchSellerById } from '@/services/sellerService'
import { fetchShipmentById } from '@/services/shipmentService'

interface PageProps {
  searchParams: Promise<{ pedidoId?: string; envioId?: string }>
}

export default async function SeguimientoEnvioPage({ searchParams }: PageProps) {
  const { userId } = await auth()
  const { pedidoId, envioId } = await searchParams

  if (!userId) {
    redirect(`/sign-in?redirectUrl=/seguimiento_envio?pedidoId=${pedidoId}&envioId=${envioId}`)
  }

  if (!envioId) {
    return (
      <Container maxW="container.sm" py={8}>
        <Flex direction="column" align="center" gap={4} role="alert" aria-live="assertive">
          <Icon as={FaExclamationCircle} boxSize={10} color="brand.danger" aria-hidden="true" />
          <Text color="brand.textMuted">No se especificó un envío.</Text>
          <Link href="/pedidos">
            <Box px={5} py={2} border="1px solid" borderColor="brand.border" borderRadius="lg" color="brand.textMain" fontSize="sm" _hover={{ borderColor: 'brand.accent', color: 'brand.accent' }}>
              Volver a mis pedidos
            </Box>
          </Link>
        </Flex>
      </Container>
    )
  }

  let envio = null
  try {
    envio = await fetchShipmentById(envioId)
  } catch (err) {
    console.error('[SeguimientoEnvio] fetchShipmentById falló:', err)
  }

  let pedido: Pedido | null = null
  if (pedidoId) {
    const comprador = await prisma.comprador.findUnique({ where: { clerkUserId: userId } })
    if (comprador) {
      const pedidoDB = await prisma.pedido.findUnique({ where: { id: pedidoId } })
      if (pedidoDB && pedidoDB.compradorId === comprador.id) {
        let vendedorNombre: string | null = null
        try {
          const vendedor = await fetchSellerById(pedidoDB.vendedorId)
          vendedorNombre = vendedor?.razon_social ?? null
        } catch (err) {
          console.error('[SeguimientoEnvio] fetchSellerById falló:', err)
        }

        pedido = {
          id: pedidoDB.id,
          fecha: pedidoDB.fecha.toISOString(),
          comprador_id: pedidoDB.compradorId,
          vendedor_id: pedidoDB.vendedorId,
          vendedor_nombre: vendedorNombre,
          productos: pedidoDB.productosId,
          monto: pedidoDB.monto,
          estado: pedidoDB.estado as Pedido['estado'],
          envio_id: pedidoDB.envioId ?? null,
        }
      }
    }
  }

  if (!envio) {
    return (
      <Container maxW="container.sm" py={8}>
        <Flex direction="column" align="center" gap={4} role="alert" aria-live="assertive">
          <Icon as={FaExclamationCircle} boxSize={10} color="brand.danger" aria-hidden="true" />
          <Text color="brand.textMuted">No encontramos los datos del envío.</Text>
          <Link href="/pedidos">
            <Box px={5} py={2} border="1px solid" borderColor="brand.border" borderRadius="lg" color="brand.textMain" fontSize="sm" _hover={{ borderColor: 'brand.accent', color: 'brand.accent' }}>
              Volver a mis pedidos
            </Box>
          </Link>
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
          <Flex align="center" gap={3} mb={6}>
            <BackButton href={pedidoId ? `/pedidos/${pedidoId}` : '/pedidos'} />
            <VStack align="start" gap={0}>
              <Text fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider">
                Seguimiento del envío
              </Text>
              <Text fontWeight="bold" color="brand.textMain" fontSize="lg" fontFamily="mono">#{envio.id}</Text>
            </VStack>
          </Flex>

          <Box bg="brand.bgCard" border="1px solid" borderColor={cfg.color} borderRadius="xl" p={6} mb={4} position="relative" overflow="hidden" role="status" aria-label={`Estado del envío: ${cfg.label}`}>
            <Box position="absolute" top={0} left={0} right={0} h="3px" bg={cfg.color} aria-hidden="true" />
            <Flex align="center" gap={4} mb={6}>
              <Flex w="56px" h="56px" borderRadius="full" bg={cfg.bg} border="2px solid" borderColor={cfg.color} align="center" justify="center" flexShrink={0} boxShadow={`0 0 24px ${cfg.color}33`} aria-hidden="true">
                <Icon as={cfg.icon} color={cfg.color} boxSize={6} />
              </Flex>
              <VStack align="start" gap={0}>
                <Text fontSize="xl" fontWeight="black" color={cfg.color}>{cfg.label}</Text>
                <Text fontSize="sm" color="brand.textMuted">Estado actual del envío</Text>
              </VStack>
            </Flex>
            <BarraEnvio estado={envio.estado} />
          </Box>

          <Box as="section" aria-labelledby="detalles-heading" bg="brand.bgCard" border="1px solid" borderColor="brand.border" borderRadius="xl" p={5} mb={4}>
            <Text id="detalles-heading" fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider" mb={4}>
              Detalles del envío
            </Text>
            <Grid templateColumns="1fr 1fr" gap={4}>
              <VStack align="start" gap={0}>
                <Flex align="center" gap={1.5} mb={1}>
                  <Icon as={FaCalendarAlt} boxSize={3} color="brand.textMuted" aria-hidden="true" />
                  <Text fontSize="xs" color="brand.textMuted">Entrega estimada</Text>
                </Flex>
                <Text fontSize="sm" color="brand.textMain" fontWeight="semibold">
                  <time dateTime={envio.fecha_de_entrega}>{formatFechaLarga(envio.fecha_de_entrega)}</time>
                </Text>
              </VStack>
              <VStack align="start" gap={0}>
                <Flex align="center" gap={1.5} mb={1}>
                  <Icon as={FaBox} boxSize={3} color="brand.textMuted" aria-hidden="true" />
                  <Text fontSize="xs" color="brand.textMuted">Monto total</Text>
                </Flex>
                <Text fontSize="sm" color="brand.accent" fontWeight="bold">{formatMonto(envio.monto)}</Text>
              </VStack>
              <VStack align="start" gap={0} gridColumn="1 / -1">
                <Flex align="center" gap={1.5} mb={1}>
                  <Icon as={FaMapMarkerAlt} boxSize={3} color="brand.textMuted" aria-hidden="true" />
                  <Text fontSize="xs" color="brand.textMuted">Dirección de entrega</Text>
                </Flex>
                <Text fontSize="sm" color="brand.textMain" fontWeight="medium">{envio.direccion}</Text>
              </VStack>
            </Grid>
          </Box>

          {pedido && (
            <Box as="section" aria-labelledby="pedido-heading" bg="brand.bgCard" border="1px solid" borderColor="brand.border" borderRadius="xl" p={5} mb={4}>
              <Text id="pedido-heading" fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider" mb={4}>
                Pedido asociado
              </Text>
              <Grid templateColumns="1fr 1fr" gap={3}>
                <VStack align="start" gap={0}>
                  <Text fontSize="xs" color="brand.textMuted">Número</Text>
                  <Text fontSize="sm" color="brand.textMain" fontWeight="medium" fontFamily="mono">#{pedido.id}</Text>
                </VStack>
                <VStack align="start" gap={0}>
                  <Text fontSize="xs" color="brand.textMuted">Estado del pago</Text>
                  <Text fontSize="sm" color="brand.textMain" fontWeight="medium">{ESTADO_PEDIDO_LABEL[pedido.estado]}</Text>
                </VStack>
                <VStack align="start" gap={0}>
                  <Text fontSize="xs" color="brand.textMuted">Vendedor</Text>
                  <Text fontSize="sm" color="brand.textMain" fontWeight="medium">
                    {pedido.vendedor_nombre ?? 'Vendedor desconocido'}
                  </Text>
                </VStack>
                <VStack align="start" gap={0}>
                  <Text fontSize="xs" color="brand.textMuted">Productos</Text>
                  <Text fontSize="sm" color="brand.textMain" fontWeight="medium">
                    {pedido.productos.length} {pedido.productos.length === 1 ? 'artículo' : 'artículos'}
                  </Text>
                </VStack>
                <VStack align="start" gap={0} gridColumn="1 / -1">
                  <Text fontSize="xs" color="brand.textMuted">Monto</Text>
                  <Text fontSize="sm" color="brand.textMain" fontWeight="medium">{formatMonto(pedido.monto)}</Text>
                </VStack>
              </Grid>
              <Link href={`/pedidos/${pedido.id}`} style={{ display: 'block', width: '100%' }}>
                <Box mt={4} w="full" py={2.5} px={4} borderRadius="lg" border="1px solid" borderColor="brand.border" color="brand.textMuted" fontSize="sm" transition="all 0.2s" _hover={{ borderColor: 'brand.accent', color: 'brand.accent' }}>
                  <Flex align="center" justify="center" gap={2}>
                    <Icon as={FaArrowLeft} boxSize={3} aria-hidden="true" />
                    <Text>Ver detalle completo del pedido</Text>
                  </Flex>
                </Box>
              </Link>
            </Box>
          )}
        </main>
      </Container>
    </>
  )
}