'use client'

import {
  Box, Container, Flex, Grid, Heading, Text,
  VStack, HStack, Icon,
} from '@chakra-ui/react'
import { FaBox } from 'react-icons/fa'
import { BackButton } from '@/components/ui/BackButton'
import { SkipLink } from '@/components/ui/SkipLink'
import { BarraProgreso } from '@/components/pedidos/BarraProgreso'
import { ProductoRow } from '@/components/pedidos/ProductoRow'
import { SeguimientoSection } from '@/components/pedidos/SeguimientoSection'
import { Pedido, ProductoConCantidad } from '@/types/pedido'
import { Shipment } from '@/services/shipmentService'
import { ESTADO_CONFIG, formatMonto } from '@/utils/pedidoUtils'
import { formatFechaConHora } from '@/utils/formatDate'

interface Props {
  pedido: Pedido
  productos: ProductoConCantidad[]
  envio: Shipment | null
}

export default function PedidoDetallePage({ pedido, productos, envio }: Props) {
  const config = ESTADO_CONFIG[pedido.estado]

  return (
    <Container maxW="container.md" py={8} px={{ base: 4, md: 6 }}>
      <SkipLink />
      <main id="main-content">

        {/* Encabezado */}
        <Flex align="center" gap={3} mb={6}>
          <BackButton href="/pedidos" />
          <VStack align="start" gap={0}>
            <Text fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider">
              Detalle del pedido
            </Text>
            <Heading as="h1" size="lg" color="brand.textMain" fontFamily="mono">
              #{pedido.id}
            </Heading>
          </VStack>
          <HStack
            ml="auto" px={3} py={1}
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
        <Box bg="brand.bgCard" border="1px solid" borderColor="brand.border" borderRadius="xl" p={5} mb={4}>
          <Text fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider" mb={4}>
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
          p={5} mb={4}
        >
          <Text id="productos-heading" fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider" mb={3}>
            Productos
          </Text>

          {productos.length > 0 ? (
            <Box as="ul" listStyleType="none" role="list" aria-label="Lista de productos del pedido">
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

          <Flex justify="space-between" align="center" pt={4} mt={2} borderTop="1px solid" borderColor="brand.border">
            <Text fontSize="sm" color="brand.textMuted" fontWeight="medium">Total del pedido</Text>
            <Text fontSize="2xl" fontWeight="black" color="brand.accent" aria-label={`Total: ${formatMonto(pedido.monto)}`}>
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
          p={5} mb={4}
        >
          <Text id="info-heading" fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider" mb={3}>
            Información del pedido
          </Text>
          <Grid templateColumns="1fr 1fr" gap={4}>
            <VStack align="start" gap={0}>
              <Text fontSize="xs" color="brand.textMuted">Fecha</Text>
              <Text fontSize="sm" color="brand.textMain" fontWeight="medium">
                <time dateTime={pedido.fecha} suppressHydrationWarning>
                  {formatFechaConHora(pedido.fecha)}
                </time>
              </Text>
            </VStack>
            <VStack align="start" gap={0}>
              <Text fontSize="xs" color="brand.textMuted">Vendedor</Text>
              <Text fontSize="sm" color="brand.textMain" fontWeight="medium">
                {pedido.vendedor_nombre ?? `#${pedido.vendedor_id}`}
              </Text>
            </VStack>
          </Grid>
        </Box>

        {/* Seguimiento */}
        {envio && (
          <SeguimientoSection
            envio={envio}
            pedidoId={pedido.id}
          />
        )}

      </main>
    </Container>
  )
}