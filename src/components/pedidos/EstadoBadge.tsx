'use client'

import { HStack, Icon, Text } from '@chakra-ui/react'
import { ESTADO_CONFIG } from '@/utils/pedidoUtils'
import { EstadoPedido } from '@/types/pedido'

export function EstadoBadge({ estado }: { estado: EstadoPedido }) {
  const config = ESTADO_CONFIG[estado]
  return (
    <HStack
      px={3} py={1} borderRadius="full"
      bg={config.bg} border="1px solid" borderColor={config.color}
      gap={1.5}
    >
      <Icon as={config.icon} color={config.color} boxSize={3} aria-hidden="true" />
      <Text fontSize="xs" fontWeight="semibold" color={config.color}>{config.label}</Text>
    </HStack>
  )
}