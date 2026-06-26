import {
  Box, Flex, Grid, VStack, Text, Icon
} from '@chakra-ui/react'
import { FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa'
import { Shipment } from '@/services/shipmentService'
import { formatFechaLarga } from '@/utils/formatDate'
import { SeguimientoButton } from './SeguimientoButton'

interface SeguimientoSectionProps {
  envio: Shipment
  pedidoId: string
}

export function SeguimientoSection({ envio, pedidoId }: SeguimientoSectionProps) {
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