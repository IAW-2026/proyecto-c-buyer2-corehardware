import Link from 'next/link'
import { Box, Flex, Grid, Text, VStack } from "@chakra-ui/react"
import { Pedido } from "@/types/pedido"
import { formatFecha } from "@/utils/formatDate"
import { ESTADO_CONFIG, formatMonto } from "@/utils/pedidoUtils"
import { EstadoBadge } from './EstadoBadge'

export function PedidoCard({ pedido }: { pedido: Pedido }) {
    const config = ESTADO_CONFIG[pedido.estado]
    const cantidadProductos = pedido.productos.length
    const montoFormateado = formatMonto(pedido.monto)

    return (
        <Box
            as="article"
            aria-label={`Pedido número ${pedido.id}, estado ${config.label}, total ${montoFormateado}`}
            bg="brand.bgCard"
            border="1px solid"
            borderColor="brand.border"
            borderRadius="xl"
            p={5}
            transition="all 0.2s"
            _hover={{ borderColor: 'brand.accent', transform: 'translateY(-2px)', boxShadow: '0 8px 30px rgba(0,209,255,0.08)' }}
            _focusWithin={{ borderColor: 'brand.accent', boxShadow: '0 0 0 2px rgba(0,209,255,0.4)' }}
            position="relative"
            overflow="hidden"
        >
            <Box position="absolute" top={0} left={0} right={0} h="2px" bg={config.color} opacity={0.7} aria-hidden="true" />

            <Flex justify="space-between" align="flex-start" mb={4}>
                <VStack align="start" gap={0}>
                    <Text fontSize="xs" color="brand.textMuted" letterSpacing="wider" textTransform="uppercase" aria-hidden="true">
                        Pedido
                    </Text>
                    <Text fontWeight="bold" color="brand.textMain" fontSize="lg" fontFamily="mono" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" maxW="200px">
                        #{pedido.id}
                    </Text>
                </VStack>

                <EstadoBadge estado={pedido.estado} />
            </Flex>

            <Grid templateColumns="1fr 1fr" gap={3} mb={4}>
                <VStack align="start" gap={0}>
                    <Text fontSize="xs" color="brand.textMuted" id={`fecha-label-${pedido.id}`}>Fecha</Text>
                    <Text fontSize="sm" color="brand.textMain" fontWeight="medium">
                        <time dateTime={pedido.fecha} aria-labelledby={`fecha-label-${pedido.id}`} suppressHydrationWarning>
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
                    <Text fontSize="sm" color={pedido.envio_id ? 'brand.accent' : 'brand.textMuted'} fontWeight="medium" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" maxW="120px">
                        {pedido.envio_id ? `#${pedido.envio_id}` : '—'}
                    </Text>
                </VStack>
                <VStack align="start" gap={0}>
                    <Text fontSize="xs" color="brand.textMuted">Vendedor</Text>
                    <Text fontSize="sm" color="brand.textMain" fontWeight="medium" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" maxW="120px">
                        {pedido.vendedor_nombre ?? `#${pedido.vendedor_id}`}
                    </Text>
                </VStack>
            </Grid>

            <Flex justify="space-between" align="center" pt={3} borderTop="1px solid" borderColor="brand.border">
                <Link
                    href={`/pedidos/${pedido.id}`}
                    aria-label={`Ver detalle del pedido ${pedido.id}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'inherit', fontSize: '12px' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true">
                        <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
                    </svg>
                    <Text color="brand.textMuted" fontSize="xs">Ver detalle</Text>
                </Link>
                <Text fontSize="xl" fontWeight="black" color="brand.accent" aria-hidden="true">
                    {montoFormateado}
                </Text>
            </Flex>
        </Box>
    )
}