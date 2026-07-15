import { Box, Center, VStack, Spinner, Text } from '@chakra-ui/react'

export function ProductosLoading() {
  return (
    <Box as="main" bg="brand.bgMain" minH="100vh">
      <Center mt={20}>
        <VStack gap={4}>
          <Spinner
            color="brand.accent"
            size="xl"
            borderWidth="4px"
            aria-label="Cargando productos"
          />
          <Text color="brand.accent" fontWeight="bold" letterSpacing="widest">
            CARGANDO HARDWARE...
          </Text>
        </VStack>
      </Center>
    </Box>
  )
}

export function ProductoLoading() {
  return (
    <Box as="main" bg="brand.bgMain" minH="100vh">
      <Center mt={20}>
        <VStack gap={4}>
          <Spinner
            color="brand.accent"
            size="xl"
            borderWidth="4px"
            aria-label="Cargando producto"
          />
          <Text color="brand.accent" fontWeight="bold" letterSpacing="widest">
            CARGANDO PRODUCTOS...
          </Text>
        </VStack>
      </Center>
    </Box>
  )
}