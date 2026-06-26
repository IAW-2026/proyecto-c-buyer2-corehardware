'use client'
import { Box, Flex, VStack, Text, Icon } from '@chakra-ui/react'
import { ENVIO_CONFIG, EstadoEnvio } from '@/utils/seguimientoUtils'
import { BarraEnvio } from '@/components/seguimiento/BarraEnvio'

interface Props {
  estado: string
}

export function EstadoEnvioHeader({ estado }: Props) {
  const estadoEnvio = estado as EstadoEnvio
  const cfg = ENVIO_CONFIG[estadoEnvio] ?? ENVIO_CONFIG.pending

  return (
    <Box
      bg="brand.bgCard"
      border="1px solid"
      borderColor={cfg.color}
      borderRadius="xl"
      p={6} mb={4}
      position="relative"
      overflow="hidden"
      role="status"
      aria-label={`Estado del envío: ${cfg.label}`}
    >
      <Box position="absolute" top={0} left={0} right={0} h="3px" bg={cfg.color} aria-hidden="true" />
      <Flex align="center" gap={4} mb={6}>
        <Flex
          w="56px" h="56px"
          borderRadius="full"
          bg={cfg.bg}
          border="2px solid"
          borderColor={cfg.color}
          align="center" justify="center"
          flexShrink={0}
          boxShadow={`0 0 24px ${cfg.color}33`}
          aria-hidden="true"
        >
          <Icon as={cfg.icon} color={cfg.color} boxSize={6} />
        </Flex>
        <VStack align="start" gap={0}>
          <Text fontSize="xl" fontWeight="black" color={cfg.color}>{cfg.label}</Text>
          <Text fontSize="sm" color="brand.textMuted">Estado actual del envío</Text>
        </VStack>
      </Flex>
      <BarraEnvio estado={estado} />
    </Box>
  )
}