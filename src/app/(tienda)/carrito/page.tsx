'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useSession } from '@clerk/nextjs'
import { useCart } from '@/context/CartContext'
import { PaymentService } from '@/services/paymentService'
import {
  Box, Container, Flex, Text, VStack,
  HStack, Spinner, Icon, Image,
} from '@chakra-ui/react'
import { FaTrash, FaPlus, FaMinus, FaShoppingCart, FaArrowLeft } from 'react-icons/fa'
import { toaster } from '@/components/ui/toaster'
import { BackButton } from '@/components/ui/BackButton'

export default function CarritoPage() {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useAuth()
  const { session } = useSession()
  const {
    items, total, incrementarCantidad, decrementarCantidad,
    limpiarCarrito, remover, costoEnvio, subtotalProductos,
  } = useCart()

  const [isProcessing, setIsProcessing] = useState(false)

  const handleCheckout = async () => {
    if (!isSignedIn || !session) {
      toaster.create({
        title: 'Inicio de sesión requerido',
        description: 'Debés estar logueado para finalizar la compra.',
        type: 'info',
      })
      router.push('/sign-in?redirectUrl=/carrito')
      return
    }

    if (isProcessing) return

    try {
      setIsProcessing(true)

      const token = await session.getToken()
      if (!token) {
        toaster.create({
          title: 'Error de autenticación',
          description: 'No se pudo validar tu sesión. Reingresá a tu cuenta.',
          type: 'error',
        })
        return
      }

      const productosAplanados = items.flatMap(item =>
        Array(item.cantidad || 1).fill(item.id)
      )

      const pedidoPayload = {
        fecha: new Date().toLocaleString('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires' }).replace(' ', 'T'),
        vendedorId: items[0]?.vendedorId || 1,
        productos: productosAplanados,
        monto: total,
      }

      const respuestaPago = await PaymentService.iniciarCheckout(pedidoPayload, token)
      console.log('Checkout exitoso:', respuestaPago)

      toaster.create({
        title: '¡Pedido procesado!',
        description: 'Iniciando compra...',
        type: 'success',
      })

      limpiarCarrito()

      // if (respuestaPago.init_point) window.location.href = respuestaPago.init_point

    } catch (error) {
      console.error('Error en checkout:', error)
      toaster.create({
        title: 'Error de conexión',
        description: 'No se pudo comunicar con el servicio de pagos. Intentá de nuevo.',
        type: 'error',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isLoaded) {
    return (
      <Flex justify="center" align="center" minH="60vh" role="status" aria-label="Cargando carrito">
        <Spinner color="brand.accent" size="lg" />
      </Flex>
    )
  }

  return (
    <Box
      maxW="container.xl"
      w="full"
      mx="auto"
      py={8}
      px={{ base: 4, md: 6 }}
      style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {/* Encabezado */}
      <Flex align="center" gap={3} mb={8}>
        <BackButton href="/productos" />
        <VStack align="start" gap={0}>
          <Text fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider">
            Compra
          </Text>
          <Text fontSize="2xl" fontWeight="black" color="brand.textMain">
            Tu Carrito
          </Text>
        </VStack>

      </Flex>

      {/* Carrito vacío */}
      {items.length === 0 ? (
        <Flex
          flex={1}
          direction="column"
          align="center"
          justify="center"
          gap={4}
          pb="80px"
          role="status"
          aria-label="El carrito está vacío"
        >
          <Box
            p={6}
            borderRadius="full"
            bg="rgba(0,209,255,0.08)"
            border="1px solid"
            borderColor="brand.border"
            aria-hidden="true"
          >
            <Icon as={FaShoppingCart} boxSize={10} color="brand.textMuted" />
          </Box>
          <VStack gap={1}>
            <Text fontSize="xl" fontWeight="bold" color="brand.textMain">
              Tu carrito está vacío
            </Text>
            <Text color="brand.textMuted" textAlign="center" maxW="300px">
              Explorá el catálogo y agregá componentes para empezar
            </Text>
          </VStack>
          <Box
            as="button"
            px={6} py={3}
            bg="brand.accent"
            color="brand.bgMain"
            borderRadius="lg"
            fontWeight="bold"
            fontSize="sm"
            transition="all 0.2s"
            _hover={{ opacity: 0.85 }}
            _focus={{ outline: '2px solid', outlineColor: 'brand.accent', outlineOffset: '2px' }}
            onClick={() => router.push('/productos')}
            aria-label="Ir al catálogo de productos"
          >
            Ver catálogo
          </Box>
        </Flex>

      ) : (
        <Flex direction={{ base: 'column', lg: 'row' }} gap={6} align="flex-start">

          {/* Lista de productos */}
          <VStack
            flex="2"
            gap={3}
            align="stretch"
            as="section"
            aria-label="Productos en el carrito"
          >
            {items.map((item) => (
              <Box
                key={item.id}
                as="article"
                aria-label={`${item.nombre}, cantidad ${item.cantidad}, precio ${(item.precio * item.cantidad).toLocaleString('es-AR')}`}
                bg="brand.bgCard"
                border="1px solid"
                borderColor="brand.border"
                borderRadius="xl"
                p={4}
                transition="border-color 0.2s"
                _hover={{ borderColor: 'brand.accent' }}
              >
                <Flex
                  align="center"
                  gap={4}
                  direction={{ base: 'column', sm: 'row' }}
                >
                  {/* Imagen */}
                  <Box
                    bg="white"
                    borderRadius="lg"
                    overflow="hidden"
                    border="1px solid"
                    borderColor="brand.border"
                    w="72px"
                    h="72px"
                    flexShrink={0}
                  >
                    <Image
                      src={item.imagen || '/placeholder-hardware.png'}
                      alt={`Imagen de ${item.nombre}`}
                      w="full"
                      h="full"
                      objectFit="contain"
                      p={1}
                    />
                  </Box>

                  {/* Info */}
                  <VStack align="start" gap={0} flex={1} minW={0}>
                    <Text fontWeight="bold" color="brand.textMain" fontSize="sm" overflow="hidden" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {item.nombre}
                    </Text>
                    <Text fontSize="xs" color="brand.textMuted">
                      {item.marca || 'Genérica'}
                    </Text>
                    <Text fontSize="sm" color="brand.accent" fontWeight="semibold" mt={1}>
                      ${item.precio.toLocaleString('es-AR')} c/u
                    </Text>
                  </VStack>

                  {/* Controles */}
                  <Flex align="center" gap={4} flexShrink={0}>
                    {/* Cantidad */}
                    <HStack gap={0}>
                      <Box
                        as="button"
                        w="30px" h="30px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="md"
                        border="1px solid"
                        borderColor="brand.border"
                        color="brand.textMuted"
                        aria-disabled={item.cantidad <= 1}
                        onClick={() => item.cantidad > 1 && decrementarCantidad(item.id)}
                        cursor={item.cantidad <= 1 ? 'not-allowed' : 'pointer'}
                        opacity={item.cantidad <= 1 ? 0.4 : 1}
                        _hover={item.cantidad <= 1 ? {} : { borderColor: 'brand.accent', color: 'brand.accent' }}
                        transition="all 0.15s"
                        aria-label={`Restar cantidad de ${item.nombre}`}
                      >
                        <Icon as={FaMinus} boxSize={2.5} />
                      </Box>

                      <Text
                        fontWeight="bold"
                        color="brand.textMain"
                        fontSize="sm"
                        px={3}
                        minW="36px"
                        textAlign="center"
                        aria-label={`Cantidad: ${item.cantidad}`}
                      >
                        {item.cantidad}
                      </Text>

                      <Box
                        as="button"
                        w="30px" h="30px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="md"
                        border="1px solid"
                        borderColor="brand.border"
                        color="brand.textMuted"
                        onClick={() => incrementarCantidad(item.id)}
                        cursor="pointer"
                        _hover={{ borderColor: 'brand.accent', color: 'brand.accent' }}
                        transition="all 0.15s"
                        aria-label={`Sumar cantidad de ${item.nombre}`}
                      >
                        <Icon as={FaPlus} boxSize={2.5} />
                      </Box>
                    </HStack>

                    {/* Subtotal */}
                    <Text
                      fontWeight="bold"
                      color="brand.textMain"
                      fontSize="sm"
                      minW="90px"
                      textAlign="right"
                      aria-label={`Subtotal: $${(item.precio * item.cantidad).toLocaleString('es-AR')}`}
                    >
                      ${(item.precio * item.cantidad).toLocaleString('es-AR')}
                    </Text>

                    {/* Eliminar */}
                    <Box
                      as="button"
                      w="30px" h="30px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="brand.border"
                      color="brand.danger"
                      onClick={() => remover(item.id)}
                      cursor="pointer"
                      _hover={{ borderColor: 'brand.danger', bg: 'rgba(248,81,73,0.08)' }}
                      transition="all 0.15s"
                      aria-label={`Eliminar ${item.nombre} del carrito`}
                    >
                      <Icon as={FaTrash} boxSize={3} />
                    </Box>
                  </Flex>
                </Flex>
              </Box>
            ))}
          </VStack>

          {/* Resumen */}
          <Box
            flex="1"
            bg="brand.bgCard"
            border="1px solid"
            borderColor="brand.border"
            borderRadius="xl"
            p={5}
            position={{ lg: 'sticky' }}
            top={{ lg: '80px' }}
            as="aside"
            aria-label="Resumen del pedido"
          >
            <Text fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider" mb={4}>
              Resumen del pedido
            </Text>

            <VStack gap={3} mb={4}>
              <Flex justify="space-between" w="full">
                <Text fontSize="sm" color="brand.textMuted">Subtotal</Text>
                <Text fontSize="sm" color="brand.textMain" fontWeight="medium">
                  ${subtotalProductos.toLocaleString('es-AR')}
                </Text>
              </Flex>
              <Flex justify="space-between" w="full">
                <Text fontSize="sm" color="brand.textMuted">Envío</Text>
                {costoEnvio === 0 ? (
                  <Text fontSize="sm" color="#34D399" fontWeight="bold">Gratis</Text>
                ) : (
                  <Text fontSize="sm" color="brand.textMain" fontWeight="medium">
                    ${costoEnvio.toLocaleString('es-AR')}
                  </Text>
                )}
              </Flex>
            </VStack>

            <Box borderTop="1px solid" borderColor="brand.border" pt={4} mb={5}>
              <Flex justify="space-between" align="center">
                <Text fontWeight="bold" color="brand.textMain">Total</Text>
                <Text fontSize="xl" fontWeight="black" color="brand.accent">
                  ${total.toLocaleString('es-AR')}
                </Text>
              </Flex>
            </Box>

            {/* Botón checkout */}
            <Box
              as="button"
              w="full"
              py={3}
              bg="brand.accent"
              color="brand.bgMain"
              borderRadius="lg"
              fontWeight="bold"
              fontSize="sm"
              transition="all 0.2s"
              _hover={{ opacity: 0.85 }}
              _focus={{ outline: '2px solid', outlineColor: 'brand.accent', outlineOffset: '2px' }}
              aria-disabled={isProcessing}
              onClick={handleCheckout}
              aria-label={isSignedIn ? 'Iniciar compra' : 'Iniciar sesión para finalizar la compra'}
            >
              <Flex align="center" justify="center" gap={2}>
                {isProcessing && <Spinner size="xs" />}
                <Text>
                  {isProcessing
                    ? 'Iniciando compra...'
                    : isSignedIn
                      ? 'Iniciar compra'
                      : 'Logueate para comprar'}
                </Text>
              </Flex>
            </Box>

            {/* Vaciar carrito */}
            <Box
              as="button"
              w="full"
              py={2.5}
              mt={3}
              border="1px solid"
              borderColor="brand.border"
              borderRadius="lg"
              color="brand.textMuted"
              fontSize="sm"
              transition="all 0.2s"
              _hover={{ borderColor: 'brand.danger', color: 'brand.danger' }}
              _focus={{ outline: '2px solid', outlineColor: 'brand.accent', outlineOffset: '2px' }}
              onClick={limpiarCarrito}
              aria-label="Vaciar carrito"
            >
              Vaciar carrito
            </Box>
          </Box>
        </Flex>
      )}
    </Box>

  )
}