'use client'
import { Box, Image, Text, HStack, Icon } from '@chakra-ui/react'
import { FaStore } from 'react-icons/fa'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ProductSummary } from '@/types/producto'
import { formatPrecio } from '@/utils/formatPrecio'

const AddToCartButton = dynamic(
  async () => {
    const mod = await import('@/components/ui/AddToCartButton')
    return mod.AddToCartButton
  },
  { ssr: false }
)

const CartBadge = dynamic(
  async () => {
    const mod = await import('@/components/productos/CartBadge')
    return mod.CartBadge
  },
  { ssr: false }
)

interface ProductoCardProps {
  producto: ProductSummary
}

export default function ProductoCard({ producto }: ProductoCardProps) {
  return (
    <Box
      as="article"
      aria-label={`${producto.nombre}, ${formatPrecio(producto.precio)}`}
      bg="brand.bgCard"
      borderRadius="xl"
      overflow="hidden"
      border="1px solid"
      borderColor="brand.border"
      position="relative"
      transition="all 0.3s ease"
      _hover={{
        transform: 'translateY(-5px)',
        borderColor: 'brand.accent',
        shadow: '0 0 20px rgba(0, 209, 255, 0.15)',
      }}
    >
      <CartBadge productoId={producto.id} />

      <Link href={`/productos/${producto.id}`} aria-label={`Ver detalle de ${producto.nombre}`}>
        <Box position="relative" pt="100%" bg="white">
          <Image
            src={producto.imagen || 'https://via.placeholder.com/400'}
            alt={producto.nombre}
            position="absolute"
            top="0" left="0"
            w="full" h="full"
            objectFit="contain"
            p={2}
          />
        </Box>
        <Box p={4}>
          <Text fontWeight="bold" fontSize="xs" color="brand.accent" mb={1}>
            {producto.marca?.toUpperCase() || 'GENERIC'}
          </Text>
          <HStack gap={1} mb={2} color="brand.textMuted" fontSize="xs">
            <Icon as={FaStore} boxSize={3} aria-hidden="true" />
            <Text fontWeight="bold" lineClamp={1}>
              {producto.vendedor?.toUpperCase() || 'GENERIC'}
            </Text>
          </HStack>
          <Text
            fontWeight="bold"
            fontSize="md"
            color="brand.textMain"
            lineClamp={2}
            mb={2}
            h="2.8rem"
          >
            {producto.nombre}
          </Text>
          <Text fontSize="xl" fontWeight="black" color="brand.textMain">
            {formatPrecio(producto.precio)}
          </Text>
        </Box>
      </Link>

      <Box p={4} pt={0}>
        {producto.stock > 0 && producto.stock <= 5 && (
          <Text fontSize="md" color="orange.400" fontWeight="semibold" mb={2}>
            ¡Últimas {producto.stock} unidades!
          </Text>
        )}
        <AddToCartButton producto={producto} />
      </Box>
    </Box>
  )
}