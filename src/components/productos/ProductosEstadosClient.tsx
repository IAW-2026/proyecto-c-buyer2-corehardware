'use client'

import { Box, Center, VStack, Heading, Button, Icon } from '@chakra-ui/react'
import { Text } from '@chakra-ui/react'
import { FaSearch } from 'react-icons/fa'

interface ProductosEmptyStateProps {
  hayFiltrosActivos: boolean
  onLimpiarFiltros: () => void
}

export function ProductosEmptyState({
  hayFiltrosActivos,
  onLimpiarFiltros,
}: ProductosEmptyStateProps) {
  return (
    <Box as="main" bg="brand.bgMain" minH="100vh">
      <Center mt={20} p={10}>
        <VStack gap={6}>
          <Box fontSize="6xl" color="brand.accent">
            <Icon as={FaSearch} aria-hidden="true" />
          </Box>
          <Heading size="lg" textAlign="center" color="brand.textMain">
            No hay productos disponibles
          </Heading>
          {hayFiltrosActivos && (
            <Text color="brand.textMuted" textAlign="center">
              Probá con otros filtros o eliminá los actuales.
            </Text>
          )}
          <Button
            variant="outline"
            borderColor="brand.accent"
            color="brand.accent"
            onClick={onLimpiarFiltros}
            borderRadius="full"
            px={10}
            py={6}
            fontSize="md"
            fontWeight="bold"
            aria-label={
              hayFiltrosActivos
                ? 'Limpiar filtros activos'
                : 'Reintentar carga de productos'
            }
          >
            {hayFiltrosActivos ? 'Limpiar filtros' : 'Reintentar'}
          </Button>
        </VStack>
      </Center>
    </Box>
  )
}

interface ProductoNotFoundProps {
  onVolver: () => void
}

export function ProductoNotFound({ onVolver }: ProductoNotFoundProps) {
  return (
    <Box bg="brand.bgMain" minH="100vh">
      <Center mt={20} p={10}>
        <VStack gap={6}>
          <Heading size="lg" color="brand.textMain" textAlign="center">
            Producto no encontrado
          </Heading>
          <Button
            onClick={onVolver}
            variant="outline"
            borderColor="brand.accent"
            color="brand.accent"
            borderRadius="full"
            px={10}
            aria-label="Volver al listado de productos"
          >
            Volver al catálogo
          </Button>
        </VStack>
      </Center>
    </Box>
  )
}