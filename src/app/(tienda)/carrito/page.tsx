'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useSession } from '@clerk/nextjs'
import { useCart } from '@/context/CartContext'
import { PaymentService } from '@/services/paymentService'
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  IconButton,
  Image,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { AddIcon, MinusIcon, DeleteIcon } from '@chakra-ui/icons'
import { toaster } from "@/components/ui/toaster"
import { useComprador } from '@/app/hooks/useComprador'

export default function CarritoPage() {
  const router = useRouter()

  // Autenticación con Clerk
  const { isSignedIn, isLoaded } = useAuth()
  const { session } = useSession()

 // Hook personalizado para obtener datos del comprador 
  const { comprador } = useComprador() 

  // Datos del Carrito Global (Asegúrate de que coincida con tus nombres del CartContext)
  const { items, total, incrementarCantidad, decrementarCantidad, limpiarCarrito, remover, costoEnvio, subtotalProductos } = useCart()

  // Estado para controlar el spinner del botón de compra
  const [isProcessing, setIsProcessing] = useState(false)

  // Función principal del checkout
  const handleCheckout = async () => {
    // 1. Guardián de sesión: si no está logueado, lo mandamos a iniciar sesión
    if (!isSignedIn || !session) {
      toaster.create({
        title: 'Inicio de sesión requerido',
        description: 'Debes estar logueado para finalizar la compra.',
        type: 'info'
      })
      router.push('/sign-in?redirectUrl=/carrito')
      return
    }

    // Evitar doble envío si ya está cargando
    if (isProcessing) return

    try {
      setIsProcessing(true)

      // 2. PEDIR EL TOKEN JWT VIGENTE A CLERK (La pulsera digital)
      const token = await session.getToken()
      if (!token) {
        toaster.create({
          title: "Error de autenticación",
          description: "No se pudo validar tu sesión con Clerk. Reingresá a tu cuenta.",
          type: "error", 
        })
        return // Frenamos la ejecución si llega a ser null
      }
      // 3. CUMPLIR CONTRATO 03-APIS.MD: Aplanar los productos según su cantidad
      // Si hay un producto con ID 12 y cantidad 2, genera [12, 12]
      const productosAplanados = items.flatMap(item =>
        Array(item.cantidad || 1).fill(item.id)
      )

      //TODO CORREGIR DEBAJO EL NUMERO DE COMPRADOR
      // 4. Armar el JSON del pedido idéntico al diseño acordado
      const pedidoPayload = {
        id: Math.floor(Math.random() * 100000), // ID aleatorio temporal para el pedido
        fecha: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
        compradorId: comprador?.id ?? 0, // Si el comprador existe entonces lo obtengo sino es cero.
        vendedorId: items[0]?.vendedorId || 1, // Tomamos el vendedor del primer ítem
        productos: productosAplanados, // El array de números planos
        monto: total // El total de dinero calculado por el contexto
      }

      // 5. Enviar los datos al servicio que se conecta con la Payments App de Agustín
      const respuestaPago = await PaymentService.iniciarCheckout(pedidoPayload, token)

      console.log("Checkout exitoso en backend de pagos:", respuestaPago)

      toaster.create({
        title: '¡Pedido Procesado!',
        description: 'Inciando compra...',
        type: 'success',
      })

      // 6. Limpiamos el carrito local ya que el pedido fue tomado por el backend
      limpiarCarrito()

      // NOTA: Si mi compañero me devuelve una URL de MercadoPago en la respuesta, 
      // acá debería hacer un redireccionamiento web:
      // if (respuestaPago.init_point) window.location.href = respuestaPago.init_point

    } catch (error) {
      console.error("Error en el flujo de checkout:", error)
      toaster.create({
        title: 'Error de conexión',
        description: 'No se pudo comunicar con el servicio de pagos. Intente más tarde.',
        type: 'error'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Esperar a que Clerk cargue el estado del usuario para evitar parpadeos visuales
  if (!isLoaded) {
    return (
      <Container maxW="container.xl" py={10} textAlign="center">
        <Text>Cargando carrito de CoreHardware...</Text>
      </Container>
    )
  }

  return (
    <Container maxW="container.xl" py={10}>
      <Heading as="h1" size="xl" mb={8} color="white">
        Tu Carrito de Compras
      </Heading>

      {items.length === 0 ? (
        <Box bg="gray.800" p={8} borderRadius="lg" textAlign="center" border="1px solid" borderColor="gray.700">
          <Text fontSize="lg" color="gray.400" mb={4}>
            El carrito está vacío. ¡Agregá componentes para empezar!
          </Text>
          <Button colorScheme="blue" onClick={() => router.push('/')}>
            Ver Catálogo de Productos
          </Button>
        </Box>
      ) : (
        <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>

          {/* LISTA DE PRODUCTOS SELECCIONADOS */}
          <VStack flex="2" gap={4} align="stretch">
            {items.map((item) => (
              <Flex
                key={item.id}
                p={4}
                bg="gray.800"
                borderRadius="lg"
                border="1px solid"
                borderColor="gray.700"
                align="center"
                justify="space-between"
                direction={{ base: 'column', sm: 'row' }}
                gap={4}
              >
                <HStack gap={4} w="full">
                  <Image
                    boxSize="80px"
                    objectFit="cover"
                    src={item.imagen || '/placeholder-hardware.png'}
                    alt={item.nombre}
                    borderRadius="md"
                  />
                  <VStack align="start" gap={0}>
                    <Text fontWeight="bold" color="white" fontSize="lg">
                      {item.nombre}
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                      Marca: {item.marca || 'Genérica'}
                    </Text>
                    <Text fontWeight="semibold" color="blue.300">
                      ${item.precio.toLocaleString('es-AR')} c/u
                    </Text>
                  </VStack>
                </HStack>

                {/* CONTROLADORES DE CANTIDAD Y BORRADO */}
                <Flex align="center" justify="space-between" w={{ base: 'full', sm: 'auto' }} gap={6}>
                  <HStack maxW="120px">
                    <IconButton
                      size="sm"
                      aria-label="Restar cantidad"
                      disabled={item.cantidad <= 1}
                      onClick={() => decrementarCantidad(item.id)}
                    >
                      <MinusIcon />
                    </IconButton>
                    <Text fontWeight="bold" color="white" px={2}>
                      {item.cantidad}
                    </Text>
                    <IconButton
                      size="sm"
                      aria-label="Sumar cantidad"
                      onClick={() => incrementarCantidad(item.id)}
                    >
                      <AddIcon />
                    </IconButton>
                  </HStack>

                  <Text fontWeight="bold" color="white" minW="100px" textAlign="right">
                    ${(item.precio * item.cantidad).toLocaleString('es-AR')}
                  </Text>

                  <IconButton
                    color="brand.danger"
                    variant="ghost"
                    aria-label="Eliminar producto"
                    onClick={() => remover(item.id)}
                    _hover={{ bg: "brand.border" }} // Un hover suave que respeta tu borde
                  >
                    <DeleteIcon />
                  </IconButton>
                </Flex>
              </Flex>
            ))}
          </VStack>

          {/* RESUMEN DE COMPRA (TABLA LATERAL) */}
          <Box
            flex="1"
            bg="gray.800"
            p={6}
            borderRadius="lg"
            border="1px solid"
            borderColor="gray.700"
            height="fit-content"
          >
            <Heading as="h2" size="md" mb={4} color="white">
              Resumen del Pedido
            </Heading>

            <Stack gap={3} my={4}>
              <Flex justify="space-between">
                <Text color="gray.400">Subtotal Productos</Text>
                <Text color="white" fontWeight="medium">
                  ${subtotalProductos.toLocaleString('es-AR')}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text color="gray.400">Envío</Text>
                {costoEnvio === 0 ? (
                  <Text color="green.400" fontWeight="bold">
                    Gratis
                  </Text>
                ) : (
                  <Text color="white" fontWeight="medium">
                    ${costoEnvio.toLocaleString('es-AR')}
                  </Text>
                )}
              </Flex>

              <Box w="full" borderBottom="1px solid" borderColor="gray.600" my={2} />

              <Flex justify="space-between" fontSize="xl" fontWeight="bold">
                <Text color="white">Total General</Text>
                <Text color="blue.300">
                  ${total.toLocaleString('es-AR')}
                </Text>
              </Flex>
            </Stack>

            {/* BOTÓN DINÁMICO DE ACCIÓN PRINCIPAL */}
            <Button
              mt={6}
              colorScheme="blue"
              bg="blue.500"
              color="white"
              fontWeight="bold"
              w="full"
              size="lg"
              onClick={handleCheckout}
              loading={isProcessing}
              loadingText="Iniciando compra..."
              _hover={{ bg: "blue.400", transform: "translateY(-2px)" }}
              _active={{ transform: "translateY(0)" }}
              transition="all 0.2s"
            >
              {isSignedIn ? 'Iniciar Compra' : 'Logueate para finalizar compra'}
            </Button>
          </Box>

        </Flex>
      )}
    </Container>
  )
}


