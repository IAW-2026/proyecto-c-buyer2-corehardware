'use client'
import {
  Box, Flex, Text, Heading, Badge,
  VStack, HStack, Image
} from '@chakra-ui/react'
import { FaBox, FaShieldAlt } from 'react-icons/fa'
import { AddToCartButton } from '@/components/ui/AddToCartButton'
import { BackButton } from '@/components/ui/BackButton'
import { Product } from '@/types/producto'
import { formatPrecio } from '@/utils/formatPrecio'

interface Props {
  producto: Product
}

export default function DetalleProducto({ producto }: Props) {
  return (
    <Box bg="brand.bgMain" minH="100vh" color="brand.textMain">
      <Box px={{ base: 4, md: 8 }} py={6}>
        <BackButton href="/productos" />

        <Flex direction={{ base: 'column', md: 'row' }} gap={8} align="flex-start" mt={4}>

          {/* IMAGEN */}
          <Box
            bg="white"
            borderRadius="2xl"
            overflow="hidden"
            border="1px solid"
            borderColor="brand.border"
            w={{ base: '100%', md: '400px' }}
            minW={{ md: '400px' }}
            flexShrink={0}
          >
            <Image
              src={producto.imagen || "https://via.placeholder.com/400"}
              alt={`Imagen de ${producto.nombre}`}
              w="full"
              h={{ base: '300px', md: '400px' }}
              objectFit="contain"
              p={6}
            />
          </Box>

          {/* DATOS */}
          <VStack align="flex-start" gap={4} flex={1}>
            <Badge
              bg="brand.accent"
              color="brand.bgMain"
              px={3} py={1}
              borderRadius="md"
              fontWeight="black"
              fontSize="sm"
            >
              {producto.marca?.toUpperCase() || 'GENERIC'}
            </Badge>

            <Heading as="h1" size="xl" color="brand.textMain" lineHeight="1.2">
              {producto.nombre}
            </Heading>

            {producto.modelo && (
              <Text color="brand.textMuted" fontSize="md">
                Modelo: {producto.modelo}
              </Text>
            )}

            <Text fontSize="4xl" fontWeight="black" color="brand.textMain">
              {formatPrecio(producto.precio)}
            </Text>

            <HStack>
              <FaBox color="brand.textMuted" />
              <Text
                color={producto.stock > 0 ? 'brand.accent' : 'red.400'}
                fontWeight="bold"
                fontSize="md"
              >
                {producto.stock > 0
                  ? `${producto.stock} unidades disponibles`
                  : 'Sin stock'}
              </Text>
            </HStack>

            {producto.vendedor && (
              <Text color="brand.textMuted" fontSize="md">
                Vendido por:{' '}
                <Text as="span" color="brand.accent" fontWeight="bold">
                  {producto.vendedor}
                </Text>
              </Text>
            )}

            <Box mt={4} w="full" maxW="320px">
              <AddToCartButton producto={producto} isDetailView={true} />
            </Box>
          </VStack>
        </Flex>

        {/* DESCRIPCION Y ESPECIFICACIONES */}
        <Box mt={10} display="flex" flexDirection="column" gap={6}>
          {producto.descripcion && (
            <Box bg="brand.bgCard" borderRadius="xl" border="1px solid" borderColor="brand.border" p={6}>
              <Heading as="h2" size="md" color="brand.accent" mb={3}>Descripción</Heading>
              <Text color="brand.textMuted" fontSize="md" lineHeight="1.8">
                {producto.descripcion}
              </Text>
            </Box>
          )}

          {producto.especificaciones && (
            <Box bg="brand.bgCard" borderRadius="xl" border="1px solid" borderColor="brand.border" p={6}>
              <Heading as="h2" size="md" color="brand.accent" mb={3}>Especificaciones</Heading>
              <Text color="brand.textMuted" fontSize="md" lineHeight="1.8" whiteSpace="pre-line">
                {producto.especificaciones}
              </Text>
            </Box>
          )}

          {producto.garantia && (
            <Box bg="brand.bgCard" borderRadius="xl" border="1px solid" borderColor="brand.border" p={6}>
              <HStack mb={3}>
                <FaShieldAlt color="brand.accent" />
                <Heading as="h2" size="md" color="brand.accent">Garantía</Heading>
              </HStack>
              <Text color="brand.textMuted" fontSize="md">
                {producto.garantia}
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}