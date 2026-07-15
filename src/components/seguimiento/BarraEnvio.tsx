import { Box, Flex, VStack, Text, Icon } from '@chakra-ui/react'
import { ENVIO_PASOS, ENVIO_CONFIG, EstadoEnvio } from '@/utils/seguimientoUtils'

interface BarraEnvioProps {
  estado: string
}

export function BarraEnvio({ estado }: BarraEnvioProps) {
  const pasoActual = ENVIO_PASOS.indexOf(estado as EstadoEnvio)

  return (
    <Flex align="center" gap={0} py={2}>
      {ENVIO_PASOS.map((paso, i) => {
        const cfg = ENVIO_CONFIG[paso]
        const completado = i < pasoActual
        const activo = i === pasoActual

        return (
          <Flex key={paso} align="center" flex={i < ENVIO_PASOS.length - 1 ? 1 : 'none'}>
            <VStack gap={2} minW="80px" align="center">
              <Flex
                w="48px" h="48px"
                borderRadius="full"
                bg={activo || completado ? cfg.bg : 'transparent'}
                border="2px solid"
                borderColor={activo || completado ? cfg.color : 'brand.border'}
                align="center"
                justify="center"
                transition="all 0.3s"
                boxShadow={activo ? `0 0 20px ${cfg.color}33` : 'none'}
                aria-hidden="true"
              >
                <Icon
                  as={cfg.icon}
                  boxSize={5}
                  color={activo || completado ? cfg.color : 'brand.textMuted'}
                  aria-hidden="true"
                />
              </Flex>
              <Text
                fontSize="11px"
                textAlign="center"
                color={activo ? cfg.color : completado ? 'brand.textMuted' : 'brand.border'}
                fontWeight={activo ? 'bold' : 'normal'}
                lineHeight={1.3}
                maxW="75px"
                aria-hidden="true"
              >
                {cfg.label}
              </Text>
            </VStack>

            {i < ENVIO_PASOS.length - 1 && (
              <Box
                flex={1}
                h="2px"
                bg={completado ? ENVIO_CONFIG[ENVIO_PASOS[i]].color : 'brand.border'}
                mx={2}
                mb={6}
                transition="background 0.3s"
                aria-hidden="true"
              />
            )}
          </Flex>
        )
      })}
    </Flex>
  )
}