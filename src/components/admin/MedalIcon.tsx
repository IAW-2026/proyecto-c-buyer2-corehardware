'use client'

import { Flex, Icon, Text } from '@chakra-ui/react'
import { FaMedal, FaChartBar, FaUsers } from 'react-icons/fa'
import { MEDAL_COLORS } from '@/utils/adminUtils'

export function EmptyState() {
  return (
    <Flex direction="column" align="center" py={16} gap={3}>
      <Icon as={FaChartBar} boxSize={8} color="brand.textMuted" />
      <Text color="brand.textMuted">No hay datos todavía.</Text>
    </Flex>
  )
}

export default function MedalIcon({ posicion }: { posicion: number }) {
  return (
    <Flex align="center" justify="center" w="28px" h="28px">
      {posicion <= 3 ? (
        <Icon as={FaMedal} color={MEDAL_COLORS[posicion]} boxSize={4} aria-label={`Posición ${posicion}`} />
      ) : (
        <Text fontSize="sm" color="brand.textMuted" fontFamily="mono">{posicion}</Text>
      )}
    </Flex>
  )
}

export function EmptyStateCompradores({ search }: { search: string }) {
  return (
    <Flex direction="column" align="center" py={16} gap={3}>
      <Icon as={FaUsers} boxSize={8} color="brand.textMuted" />
      <Text color="brand.textMuted">
        {search ? 'No hay compradores con esa búsqueda.' : 'No hay compradores todavía.'}
      </Text>
    </Flex>
  )
}