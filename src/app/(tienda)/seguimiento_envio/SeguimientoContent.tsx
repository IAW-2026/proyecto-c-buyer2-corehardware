'use client'
import Link from 'next/link'
import { Box, Container, Flex, Grid, Text, VStack, Icon } from '@chakra-ui/react'
import { FaExclamationCircle, FaMapMarkerAlt, FaCalendarAlt, FaBox, FaArrowLeft } from 'react-icons/fa'
import { BackButton } from '@/components/ui/BackButton'
import { SkipLink } from '@/components/ui/SkipLink'
import { EstadoEnvioHeader } from '@/components/seguimiento/EstadoEnvioHeader'
import { Pedido } from '@/types/pedido'
import { Shipment } from '@/services/shipmentService'
import { formatMonto } from '@/utils/pedidoUtils'
import { formatFechaLarga } from '@/utils/formatDate'
import { ESTADO_PEDIDO_LABEL } from '@/utils/seguimientoUtils'

interface Props {
  envio: Shipment | null
  pedido: Pedido | null
  pedidoId?: string
  envioId?: string
}

export function SeguimientoContent({ envio, pedido, pedidoId, envioId }: Props) {
  if (!envioId) {
    return (
      <Container maxW="container.sm" py={8}>
        <Flex direction="column" align="center" gap={4} role="alert" aria-live="assertive">
          <Icon as={FaExclamationCircle} boxSize={10} color="brand.danger" aria-hidden="true" />
          <Text color="brand.textMuted">No se especificó un envío.</Text>
          <Link href="/pedidos">
            <Box px={5} py={2} border="1px solid" borderColor="brand.border" borderRadius="lg" color="brand.textMain" fontSize="sm">
              Volver a mis pedidos
            </Box>
          </Link>
        </Flex>
      </Container>
    )
  }

  if (!envio) {
    return (
      <Container maxW="container.sm" py={8}>
        <Flex direction="column" align="center" gap={4} role="alert" aria-live="assertive">
          <Icon as={FaExclamationCircle} boxSize={10} color="brand.danger" aria-hidden="true" />
          <Text color="brand.textMuted">No encontramos los datos del envío.</Text>
          <Link href="/pedidos">
            <Box px={5} py={2} border="1px solid" borderColor="brand.border" borderRadius="lg" color="brand.textMain" fontSize="sm">
              Volver a mis pedidos
            </Box>
          </Link>
        </Flex>
      </Container>
    )
  }

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

          <EstadoEnvioHeader estado={envio.estado} />

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
                <Text fontSize="sm" color="brand.textMain" fontWeight="semibold" suppressHydrationWarning>
                  <time dateTime={envio.fecha_de_entrega} suppressHydrationWarning>
                    {formatFechaLarga(envio.fecha_de_entrega)}
                  </time>
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
                  <Text fontSize="xs" color="brand.textMuted">Estado del pedido</Text>
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
                <Box mt={4} w="full" py={2.5} px={4} borderRadius="lg" border="1px solid" borderColor="brand.border" color="brand.textMuted" fontSize="sm" transition="all 0.2s">
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