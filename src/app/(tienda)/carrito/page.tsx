'use client'

import { Box, Heading, Text, VStack, Button, HStack, IconButton, Separator } from '@chakra-ui/react'
import { FaTrash } from 'react-icons/fa'
import { useCart } from '@/context/CartContext'
import { BackButton } from '@/components/ui/BackButton'

export default function CarritoPage() {
  const { items, remover } = useCart()

  // Cálculo del total
  const subtotal = items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0)

  return (
    <Box 
      bg="brand.bgMain" 
      minH="100vh" 
      p={{ base: 4, md: 8 }}
      color="brand.textMain"
    >
      <Box maxW="1000px" mx="auto">
        <BackButton />
        <Heading size="lg" mb={6} color="brand.textMain">
          Tu Carrito ({items.length} items)
        </Heading>

        {items.length === 0 ? (
          <Text color="brand.textMuted">Tu carrito está vacío.</Text>
        ) : (
          <HStack align="start" gap={8} flexDir={{ base: 'column', lg: 'row' }}>
            
            {/* LISTA DE PRODUCTOS */}
            <VStack flex="2" align="stretch" gap={4}>
              {items.map((item) => (
                <Box 
                  key={item.id} 
                  p={5} 
                  bg="brand.bgCard" 
                  borderRadius="xl" 
                  border="1px solid" 
                  borderColor="brand.border"
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Text fontWeight="bold" fontSize="lg">{item.nombre}</Text>
                    <Text color="brand.textMuted">
                      {item.cantidad} x ${item.precio.toLocaleString()}
                    </Text>
                  </Box>
                  
                  <IconButton
                    aria-label="Eliminar producto"
                    variant="ghost"
                    color="red.400"
                    onClick={() => remover(item.id)}
                    _hover={{ bg: "red.900/20" }}
                  >
                    <FaTrash />
                  </IconButton>
                </Box>
              ))}
            </VStack>

            {/* RESUMEN */}
            <Box 
              flex="1" 
              p={6} 
              bg="brand.bgCard" 
              borderRadius="xl" 
              border="1px solid" 
              borderColor="brand.border"
              position="sticky"
              top="20px"
            >
              <Heading size="md" mb={4}>Resumen</Heading>
              <HStack justify="space-between" mb={2}>
                <Text color="brand.textMuted">Subtotal</Text>
                <Text fontWeight="bold">${subtotal.toLocaleString()}</Text>
              </HStack>
              <Separator borderColor="brand.border" my={4} />
              
              <Button 
                w="full"
                bg="brand.accent" 
                color="brand.bgMain"
                fontWeight="black"
                size="lg"
                borderRadius="full"
                _hover={{ opacity: 0.9 }}
              >
                Proceder al Pago
              </Button>
            </Box>
          </HStack>
        )}
      </Box>
    </Box>
  )
}