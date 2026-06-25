'use client'

import {
  Box, Text, Image, VStack, Badge,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { ProductSummary } from '@/types/producto'
import { AddToCartButton } from '@/components/ui/AddToCartButton'
import { CartBadge } from '@/components/productos/CartBadge'

interface ProductCardProps {
  producto: ProductSummary
}

export default function ProductoCard({ producto }: ProductCardProps) {
  const router = useRouter()

  return (
    <Box
      as="article"
      aria-label={`Producto: ${producto.nombre}`}
      position="relative"
      bg="brand.bgCard"
      border="1px solid"
      borderColor="brand.border"
      borderRadius="2xl"
      overflow="hidden"
      transition="all 0.2s"
      _hover={{ borderColor: 'brand.accent', transform: 'translateY(-2px)', shadow: 'lg' }}
      display="flex"
      flexDirection="column"
    >
      {/* Badge de cantidad en carrito */}
      <CartBadge productoId={producto.id} />

      {/* Imagen — clickeable hacia el detalle */}
      <Box
        bg="white"
        h="180px"
        overflow="hidden"
        cursor="pointer"
        onClick={() => router.push(`/productos/${producto.id}`)}
        aria-label={`Ver detalle de ${producto.nombre}`}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && router.push(`/productos/${producto.id}`)}
        flexShrink={0}
      >
        <Image
          src={producto.imagen || 'https://via.placeholder.com/300'}
          alt={`Imagen de ${producto.nombre}`}
          w="full"
          h="full"
          objectFit="contain"
          p={4}
          transition="transform 0.3s"
          _groupHover={{ transform: 'scale(1.04)' }}
        />
      </Box>

      {/* Info */}
      <VStack
        align="flex-start"
        gap={2}
        p={4}
        flex={1}
        justify="space-between"
      >
        <VStack align="flex-start" gap={1} w="full">
          {producto.marca && (
            <Badge
              bg="brand.accent"
              color="brand.bgMain"
              px={2}
              py={0.5}
              borderRadius="md"
              fontWeight="black"
              fontSize="2xs"
            >
              {producto.marca.toUpperCase()}
            </Badge>
          )}

          <Text
            fontWeight="bold"
            color="brand.textMain"
            fontSize="sm"
            lineHeight="1.3"
            cursor="pointer"
            onClick={() => router.push(`/productos/${producto.id}`)}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {producto.nombre}
          </Text>

          <Text fontSize="lg" fontWeight="black" color="brand.textMain">
            ${producto.precio?.toLocaleString('es-AR')}
          </Text>

          {producto.stock <= 0 && (
            <Text fontSize="xs" color="red.400" fontWeight="semibold">
              Sin stock
            </Text>
          )}

          {producto.stock > 0 && producto.stock <= 5 && (
            <Text fontSize="xs" color="orange.400" fontWeight="semibold">
              ¡Últimas {producto.stock} unidades!
            </Text>
          )}
        </VStack>

        {/* Botón agregar / controles de cantidad */}
        <Box w="full" mt={1}>
          <AddToCartButton producto={producto} isDetailView={false} />
        </Box>
      </VStack>
    </Box>
  )
}