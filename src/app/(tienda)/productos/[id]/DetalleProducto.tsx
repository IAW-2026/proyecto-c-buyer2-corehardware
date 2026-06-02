'use client'
import { useState, useEffect } from 'react'
import {
  Box, Flex, Text, Heading, Badge,
  VStack, HStack, Image
} from '@chakra-ui/react'
import { FaBox, FaShieldAlt } from 'react-icons/fa'
import { useRouter, useParams } from 'next/navigation'
import { SellerService } from '@/services/sellerService'
import { BackButton } from '@/components/ui/BackButton'
import { AddToCartButton } from '@/components/ui/AddToCartButton'
import { Product } from '@/types/producto'
import { ProductoLoading, ProductoNotFound } from '@/components/productos/ProductosEstados'

export default function DetalleProducto() {
  const router = useRouter()
  const params = useParams()
  const id = Number(params.id)

  const [producto, setProducto] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      setLoading(true)
      const data = await SellerService.getProductById(id)
      if (!data) setNotFound(true)
      else setProducto(data)
      setLoading(false)
    }
    cargar()
  }, [id])

  if (loading) return <ProductoLoading />
  if (notFound) return <ProductoNotFound onVolver={() => router.push('/productos')} />
  if (!producto) return null

  return (
    <Box bg="brand.bgMain" minH="100vh" color="brand.textMain">
      <BackButton />

      <Box px={{ base: 4, md: 8 }} py={6}>
        <Flex direction={{ base: 'column', md: 'row' }} gap={8} align="flex-start">

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
              px={3}
              py={1}
              borderRadius="md"
              fontWeight="black"
              fontSize="xs"
            >
              {producto.marca?.toUpperCase() || 'GENERIC'}
            </Badge>

            <Heading as="h1" size="xl" color="brand.textMain" lineHeight="1.2">
              {producto.nombre}
            </Heading>

            {producto.modelo && (
              <Text color="brand.textMuted" fontSize="sm">
                Modelo: {producto.modelo}
              </Text>
            )}

            <Text fontSize="3xl" fontWeight="black" color="brand.textMain">
              ${producto.precio?.toLocaleString('es-AR')}
            </Text>

            <HStack>
              <FaBox color="brand.textMuted" />
              <Text
                color={producto.stock > 0 ? "brand.accent" : 'red.400'}
                fontWeight="bold"
                fontSize="sm"
              >
                {producto.stock > 0
                  ? `${producto.stock} unidades disponibles`
                  : 'Sin stock'}
              </Text>
            </HStack>

            {producto.vendedor && (
              <Text color="brand.textMuted" fontSize="sm">
                Vendido por:{' '}
                <Text as="span" color="brand.accent" fontWeight="bold">
                  {producto.vendedor}
                </Text>
              </Text>
            )}

            <Box mt={4}>
              <AddToCartButton producto={producto} isDetailView={true} />
            </Box>
          </VStack>
        </Flex>

        {/* DESCRIPCION Y ESPECIFICACIONES */}
        <Box mt={10} display="flex" flexDirection="column" gap={6}>
          {producto.descripcion && (
            <Box
              bg="brand.bgCard"
              borderRadius="xl"
              border="1px solid"
              borderColor="brand.border"
              p={6}
            >
              <Heading as="h2" size="md" color="brand.accent" mb={3}>
                Descripción
              </Heading>
              <Text color="brand.textMuted" lineHeight="1.8">
                {producto.descripcion}
              </Text>
            </Box>
          )}

          {producto.especificaciones && (
            <Box
              bg="brand.bgCard"
              borderRadius="xl"
              border="1px solid"
              borderColor="brand.border"
              p={6}
            >
              <Heading as="h2" size="md" color="brand.accent" mb={3}>
                Especificaciones
              </Heading>
              <Text color="brand.textMuted" lineHeight="1.8" whiteSpace="pre-line">
                {producto.especificaciones}
              </Text>
            </Box>
          )}

          {producto.garantia && (
            <Box
              bg="brand.bgCard"
              borderRadius="xl"
              border="1px solid"
              borderColor="brand.border"
              p={6}
            >
              <HStack mb={3}>
                <FaShieldAlt color="brand.accent" />
                <Heading as="h2" size="md" color="brand.accent">
                  Garantía
                </Heading>
              </HStack>
              <Text color="brand.textMuted">
                {producto.garantia}
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}