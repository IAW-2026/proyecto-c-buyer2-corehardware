'use client'

import { Box, Flex, Text, Icon } from '@chakra-ui/react'
import { FaTruck, FaChevronRight } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

interface Props {
  pedidoId: string  // antes: number
  envioId: string   // antes: number
}

export function SeguimientoButton({ pedidoId, envioId }: Props) {
  const router = useRouter()

  return (
    <Box
      as="button"
      w="full" py={2.5} px={4}
      borderRadius="lg"
      border="1px solid" borderColor="brand.border"
      color="brand.textMuted" fontSize="sm"
      transition="all 0.2s"
      _hover={{ borderColor: 'brand.accent', color: 'brand.accent', bg: 'rgba(0,209,255,0.04)' }}
      _focus={{ outline: '2px solid', outlineColor: 'brand.accent', outlineOffset: '2px' }}
      onClick={() => router.push(`/seguimiento_envio?pedidoId=${pedidoId}&envioId=${envioId}`)}
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
  )
}