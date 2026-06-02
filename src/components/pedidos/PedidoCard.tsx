import { useRouter } from "next/navigation"
import { Box, Flex, Grid, Text, VStack, HStack, Icon } from "@chakra-ui/react"
import { FaArrowRight } from "react-icons/fa"
import { Pedido } from "@/types/pedido"
import { formatFecha } from "@/utils/formatDate"
import { ESTADO_CONFIG, formatMonto } from "@/utils/pedidoUtils"

export function PedidoCard({ pedido }: { pedido: Pedido }) {
    const router = useRouter()
    const config = ESTADO_CONFIG[pedido.estado]
    const cantidadProductos = pedido.productos.length
    const montoFormateado = formatMonto(pedido.monto)

    const handleNavigate = () => router.push(`/pedidos/${pedido.id}`)

    return (
        <Box
            as="article"
            aria-label={`Pedido número ${pedido.id}, estado ${config.label}, total ${montoFormateado}`}
            bg="brand.bgCard"
            border="1px solid"
            borderColor="brand.border"
            borderRadius="xl"
            p={5}
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ borderColor: 'brand.accent', transform: 'translateY(-2px)', boxShadow: '0 8px 30px rgba(0,209,255,0.08)' }}
            _focusWithin={{ borderColor: 'brand.accent', boxShadow: '0 0 0 2px rgba(0,209,255,0.4)' }}
            onClick={handleNavigate}
            position="relative"
            overflow="hidden"
        >
            {/* Línea de acento superior según estado */}
            <Box position="absolute" top={0} left={0} right={0} h="2px" bg={config.color} opacity={0.7} aria-hidden="true" />

            {/* Cabecera */}
            <Flex justify="space-between" align="flex-start" mb={4}>
                <VStack align="start" gap={0}>
                    <Text fontSize="xs" color="brand.textMuted" letterSpacing="wider" textTransform="uppercase" aria-hidden="true">
                        Pedido
                    </Text>
                    <Text fontWeight="bold" color="brand.textMain" fontSize="lg" fontFamily="mono">
                        #{pedido.id}
                    </Text>
                </VStack>

                <HStack
                    px={3} py={1} borderRadius="full"
                    bg={config.bg} border="1px solid" borderColor={config.color}
                    gap={1.5}
                >
                    <Icon as={config.icon} color={config.color} boxSize={3} aria-hidden="true" />
                    <Text fontSize="xs" fontWeight="semibold" color={config.color}>{config.label}</Text>
                </HStack>
            </Flex>

            {/* Info */}
            <Grid templateColumns="1fr 1fr" gap={3} mb={4}>
                <VStack align="start" gap={0}>
                    <Text fontSize="xs" color="brand.textMuted" id={`fecha-label-${pedido.id}`}>Fecha</Text>
                    <Text fontSize="sm" color="brand.textMain" fontWeight="medium">
                        <time dateTime={pedido.fecha} aria-labelledby={`fecha-label-${pedido.id}`}>
                            {formatFecha(pedido.fecha)}
                        </time>
                    </Text>
                </VStack>
                <VStack align="start" gap={0}>
                    <Text fontSize="xs" color="brand.textMuted">Productos</Text>
                    <Text fontSize="sm" color="brand.textMain" fontWeight="medium">
                        {cantidadProductos} {cantidadProductos === 1 ? 'artículo' : 'artículos'}
                    </Text>
                </VStack>
                <VStack align="start" gap={0}>
                    <Text fontSize="xs" color="brand.textMuted">Envío</Text>
                    <Text fontSize="sm" color={pedido.envio_id ? 'brand.accent' : 'brand.textMuted'} fontWeight="medium">
                        {pedido.envio_id ? `#${pedido.envio_id}` : '—'}
                    </Text>
                </VStack>
                <VStack align="start" gap={0}>
                    <Text fontSize="xs" color="brand.textMuted">Vendedor</Text>
                    <Text fontSize="sm" color="brand.textMain" fontWeight="medium">#{pedido.vendedor_id}</Text>
                </VStack>
            </Grid>

            {/* Footer */}
            <Flex justify="space-between" align="center" pt={3} borderTop="1px solid" borderColor="brand.border">
                <Box
                    role="link"
                    tabIndex={0}
                    display="flex"
                    alignItems="center"
                    gap="6px"
                    color="brand.textMuted"
                    fontSize="xs"
                    cursor="pointer"
                    _focus={{ outline: '2px solid', outlineColor: 'brand.accent', outlineOffset: '2px', borderRadius: 'sm' }}
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleNavigate() }}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') handleNavigate() }}
                    aria-label={`Ver detalle del pedido ${pedido.id}`}
                >
                    <Icon as={FaArrowRight} boxSize={3} aria-hidden="true" />
                    <Text>Ver detalle</Text>
                </Box>
                <Text fontSize="xl" fontWeight="black" color="brand.accent" aria-hidden="true">
                    {montoFormateado}
                </Text>
            </Flex>
        </Box>
    )
}
