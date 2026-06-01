'use client'

import { Box, Image, Text, HStack, Icon } from '@chakra-ui/react'
import { FaStore } from 'react-icons/fa'
import Link from 'next/link'
import { AddToCartButton } from '@/components/ui/AddToCartButton'
import { ProductSummary } from '@/types/producto'

interface ProductoCardProps {
  producto: ProductSummary
}

export default function ProductoCard({ producto }: ProductoCardProps) {
  return (
    <Box
      as="article"
      aria-label={`${producto.nombre}, $${producto.precio.toLocaleString('es-AR')}`}
      bg="brand.bgCard"
      borderRadius="xl"
      overflow="hidden"
      border="1px solid"
      borderColor="brand.border"
      transition="all 0.3s ease"
      _hover={{
        transform: 'translateY(-5px)',
        borderColor: 'brand.accent',
        shadow: '0 0 20px rgba(0, 209, 255, 0.15)',
      }}
    >
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
            ${producto.precio.toLocaleString('es-AR')}
          </Text>
        </Box>
      </Link>
      <Box p={4} pt={0}>
        <AddToCartButton producto={producto} />
      </Box>
    </Box>
  )
}