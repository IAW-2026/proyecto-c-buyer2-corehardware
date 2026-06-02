'use client'

import { Box, Flex, VStack, Text, Icon } from '@chakra-ui/react'
import { EstadoPedido } from '@/types/pedido'
import { ESTADO_CONFIG, PASOS_FLUJO } from '@/utils/pedidoUtils'

interface BarraProgresoProps {
  estado: EstadoPedido
}

export function BarraProgreso({ estado }: BarraProgresoProps) {
  const config = ESTADO_CONFIG[estado]

  if (estado === 'PAGO_RECHAZADO' || estado === 'CANCELADO') {
    return (
      <Flex
        gap={3}
        p={4}
        bg={config.bg}
        border="1px solid"
        borderColor={config.color}
        borderRadius="xl"
        role="status"
        aria-label={`Estado del pedido: ${config.label}`}
        align="center"
      >
        <Icon as={config.icon} color={config.color} boxSize={4} aria-hidden="true" />
        <Text fontWeight="semibold" color={config.color} fontSize="sm">{config.label}</Text>
      </Flex>
    )
  }

  const pasoActual = PASOS_FLUJO.indexOf(estado)

  return (
    <Box
      role="status"
      aria-label={`Estado del pedido: ${config.label}. Paso ${pasoActual + 1} de ${PASOS_FLUJO.length}`}
    >
      <Flex align="center" gap={0}>
        {PASOS_FLUJO.map((paso, i) => {
          const cfg = ESTADO_CONFIG[paso]
          const completado = i < pasoActual
          const activo = i === pasoActual

          return (
            <Flex key={paso} align="center" flex={i < PASOS_FLUJO.length - 1 ? 1 : 'none'}>
              <VStack gap={1} minW="60px" align="center">
                <Flex
                  w="32px" h="32px"
                  borderRadius="full"
                  bg={activo || completado ? cfg.bg : 'transparent'}
                  border="2px solid"
                  borderColor={activo || completado ? cfg.color : 'brand.border'}
                  align="center"
                  justify="center"
                  transition="all 0.3s"
                  aria-hidden="true"
                >
                  <Icon
                    as={cfg.icon}
                    boxSize={3.5}
                    color={activo || completado ? cfg.color : 'brand.textMuted'}
                  />
                </Flex>
                <Text
                  fontSize="9px"
                  textAlign="center"
                  color={activo ? cfg.color : 'brand.textMuted'}
                  fontWeight={activo ? 'bold' : 'normal'}
                  lineHeight={1.2}
                  maxW="55px"
                  aria-hidden="true"
                >
                  {cfg.label}
                </Text>
              </VStack>

              {i < PASOS_FLUJO.length - 1 && (
                <Box
                  flex={1}
                  h="2px"
                  bg={completado ? cfg.color : 'brand.border'}
                  mx={1}
                  mb={5}
                  transition="background 0.3s"
                  aria-hidden="true"
                />
              )}
            </Flex>
          )
        })}
      </Flex>
    </Box>
  )
}