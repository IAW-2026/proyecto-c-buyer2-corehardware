import { Box, Flex, VStack, Text, Image } from '@chakra-ui/react'
import { ProductoConCantidad } from '@/types/pedido'
import { formatMonto } from '@/utils/pedidoUtils'

interface ProductoRowProps {
  producto: ProductoConCantidad
}

export function ProductoRow({ producto }: ProductoRowProps) {
  return (
    <Flex
      align="center"
      gap={4}
      py={3}
      borderBottom="1px solid"
      borderColor="brand.border"
      _last={{ borderBottom: 'none' }}
      as="li"
      aria-label={`${producto.nombre}, cantidad ${producto.cantidad}, total ${formatMonto(producto.precio * producto.cantidad)}`}
    >
      <Image
        src={producto.imagen || 'https://via.placeholder.com/56'}
        alt={`Imagen de ${producto.nombre}`}
        boxSize="56px"
        objectFit="contain"
        borderRadius="md"
        bg="white"
        p={1}
        border="1px solid"
        borderColor="brand.border"
        flexShrink={0}
      />
      <Box flex={1} minW={0}>
        <Text
          fontSize="sm"
          fontWeight="medium"
          color="brand.textMain"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          {producto.nombre}
        </Text>
        <Text fontSize="xs" color="brand.textMuted" mt={0.5}>
          {producto.marca} · x{producto.cantidad}
        </Text>
      </Box>
      <VStack align="end" gap={0} flexShrink={0}>
        <Text fontSize="sm" fontWeight="semibold" color="brand.textMain" aria-hidden="true">
          {formatMonto(producto.precio * producto.cantidad)}
        </Text>
        {producto.cantidad > 1 && (
          <Text fontSize="xs" color="brand.textMuted" aria-hidden="true">
            {formatMonto(producto.precio)} c/u
          </Text>
        )}
      </VStack>
    </Flex>
  )
}