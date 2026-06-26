import {
  Box, Flex, Grid, VStack, Text, Icon
} from '@chakra-ui/react'
import { FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa'
import { Shipment } from '@/services/shipmentService'
import { ENVIO_ESTADO_CONFIG } from '@/utils/pedidoUtils'
import { formatFechaLarga } from '@/utils/formatDate'
import { SeguimientoButton } from './SeguimientoButton'

interface SeguimientoSectionProps {
  envio: Shipment
  pedidoId: string
  estadoPedido: string
}

export function SeguimientoSection({ envio, pedidoId, estadoPedido }: SeguimientoSectionProps) {
  const envioConfig = ENVIO_ESTADO_CONFIG[estadoPedido] ?? ENVIO_ESTADO_CONFIG.pending

  return (
    <Box
      bg="brand.bgCard"
      border="1px solid"
      borderColor="brand.border"
      borderRadius="xl"
      p={5} mb={4}
      as="section"
      aria-labelledby="seguimiento-heading"
    >
      <Flex justify="space-between" align="center" mb={4}>
        <Text id="seguimiento-heading" fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider">
          Seguimiento del envío
        </Text>
        <Text fontSize="xs" color="brand.textMuted" fontFamily="mono">
          #{envio.id}
        </Text>
      </Flex>

      <Flex align="center" gap={3} mb={4}>
        <Flex
          w="40px" h="40px"
          borderRadius="full"
          bg={envioConfig.bg}
          border="1px solid"
          borderColor={envioConfig.color}
          align="center" justify="center"
          flexShrink={0}
          aria-hidden="true"
        >
          <Icon as={envioConfig.icon} color={envioConfig.color} boxSize={4} />
        </Flex>
        <VStack align="start" gap={0}>
          <Text fontSize="sm" fontWeight="semibold" color={envioConfig.color}>
            {envioConfig.label}
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
            <time dateTime={envio.fecha_de_entrega} suppressHydrationWarning>
              {formatFechaLarga(envio.fecha_de_entrega)}
            </time>
          </Text>
        </VStack>
        <VStack align="start" gap={0}>
          <Flex align="center" gap={1.5} mb={0.5}>
            <Icon as={FaMapMarkerAlt} boxSize={3} color="brand.textMuted" aria-hidden="true" />
            <Text fontSize="xs" color="brand.textMuted">Dirección</Text>
          </Flex>
          <Text fontSize="sm" color="brand.textMain" fontWeight="medium"
            overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap"
            title={envio.direccion}
          >
            {envio.direccion}
          </Text>
        </VStack>
      </Grid>

      <SeguimientoButton pedidoId={pedidoId} envioId={envio.id} />
    </Box>
  )
}