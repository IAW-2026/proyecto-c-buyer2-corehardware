'use client'

import { useState, useEffect } from 'react'
import {
  Box, Flex, Grid, VStack, Text, Icon, Spinner
} from '@chakra-ui/react'
import {
  FaCalendarAlt, FaMapMarkerAlt, FaTruck, FaChevronRight
} from 'react-icons/fa'
import { ShipmentService, Shipment } from '@/services/shipmentService'
import { ENVIO_ESTADO_CONFIG } from '@/utils/pedidoUtils'
import { formatFechaLarga } from '@/utils/formatDate'

interface SeguimientoSectionProps {
  envioId: number
  onVerDetalle: () => void
}

export function SeguimientoSection({ envioId, onVerDetalle }: SeguimientoSectionProps) {
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
                  {formatFechaLarga(envio.fecha_de_entrega)}
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