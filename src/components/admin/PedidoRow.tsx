'use client'

import { Box, HStack, Icon, Text } from '@chakra-ui/react'
import { createListCollection } from '@chakra-ui/react'
import {
  FaBox, FaCheckCircle, FaClock,
  FaTimesCircle, FaTools, FaTruck,
} from 'react-icons/fa'
import { formatFecha } from '@/utils/formatDate'
import { formatMonto, ESTADO_CONFIG } from '@/utils/pedidoUtils'

export interface PedidoAdmin {
  id: number
  fecha: string
  monto: number
  estado: string
  vendedor_id: number
  envio_id: number | null
  productos: number[]
  comprador: { id: number; nombre: string; mail: string }
}

const ICON_MAP: Record<string, React.ElementType> = {
  PENDIENTE_PAGO: FaClock,
  PAGO_APROBADO:  FaCheckCircle,
  PAGO_RECHAZADO: FaTimesCircle,
  EN_PREPARACION: FaTools,
  EN_CAMINO:      FaTruck,
  ENTREGADO:      FaCheckCircle,
  CANCELADO:      FaTimesCircle,
}

const ESTADOS_COLLECTION = createListCollection({
  items: [
    { label: 'Todos los estados', value: '' },
    { label: 'Pendiente de pago', value: 'PENDIENTE_PAGO' },
    { label: 'Pago aprobado',     value: 'PAGO_APROBADO' },
    { label: 'Pago rechazado',    value: 'PAGO_RECHAZADO' },
    { label: 'En preparación',    value: 'EN_PREPARACION' },
    { label: 'En camino',         value: 'EN_CAMINO' },
    { label: 'Entregado',         value: 'ENTREGADO' },
    { label: 'Cancelado',         value: 'CANCELADO' },
  ],
})

export default function PedidoRow({ pedido }: { pedido: PedidoAdmin }) {
  const estadoConfig = ESTADO_CONFIG[pedido.estado as keyof typeof ESTADO_CONFIG]
  const color        = estadoConfig?.color ?? '#8B949E'
  const IconComp     = ICON_MAP[pedido.estado] ?? FaBox
  const label        = ESTADOS_COLLECTION.items.find(e => e.value === pedido.estado)?.label ?? pedido.estado

  return (
    <Box as="tr" role="row" _hover={{ bg: 'rgba(255,255,255,0.02)' }} transition="background 0.15s">
      <Box as="td" px={4} py={3} fontFamily="mono" fontSize="sm" color="brand.textMuted">
        #{pedido.id}
      </Box>
      <Box as="td" px={4} py={3} fontSize="sm" color="brand.textMain">
        {pedido.comprador.nombre}
        <Text fontSize="xs" color="brand.textMuted">{pedido.comprador.mail}</Text>
      </Box>
      <Box as="td" px={4} py={3} fontSize="sm" color="brand.textMuted">
        {formatFecha(pedido.fecha)}
      </Box>
      <Box as="td" px={4} py={3}>
        <HStack gap={1.5}>
          <Icon as={IconComp} color={color} boxSize={3} aria-hidden="true" />
          <Text fontSize="xs" fontWeight="semibold" color={color}>
            {label}
          </Text>
        </HStack>
      </Box>
      <Box as="td" px={4} py={3} fontSize="sm" color="brand.textMuted" textAlign="center">
        {pedido.productos.length}
      </Box>
      <Box as="td" px={4} py={3} fontSize="sm" fontWeight="bold" color="brand.accent" textAlign="right">
        {formatMonto(pedido.monto)}
      </Box>
    </Box>
  )
}