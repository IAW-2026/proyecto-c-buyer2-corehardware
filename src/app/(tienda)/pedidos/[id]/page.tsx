'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import {
  Box, Container, Flex, Grid, Heading, Text,
  VStack, HStack, Spinner, Icon,
} from '@chakra-ui/react'
import { FaExclamationCircle, FaBox } from 'react-icons/fa'
import { BackButton } from '@/components/ui/BackButton'
import { SkipLink } from '@/components/ui/SkipLink'
import { BarraProgreso } from '@/components/pedidos/BarraProgreso'
import { ProductoRow } from '@/components/pedidos/ProductoRow'
import { SeguimientoSection } from '@/components/pedidos/SeguimientoSection'
import { SellerService } from '@/services/sellerService'
import { Pedido, ProductoConCantidad } from '@/types/pedido'
import { ESTADO_CONFIG, formatMonto, agruparProductos } from '@/utils/pedidoUtils'
import { formatFechaConHora } from '@/utils/formatDate'

export default function PedidoDetallePage() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [productos, setProductos] = useState<ProductoConCantidad[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingProductos, setLoadingProductos] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      router.push(`/sign-in?redirectUrl=/pedidos/${id}`)
      return
    }

    const fetchPedido = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/orders/${id}`)
        if (res.status === 403 || res.status === 404) {
          setError('Pedido no encontrado.')
          return
        }
        if (!res.ok) throw new Error('Error al cargar el pedido')
        const data: Pedido = await res.json()
        setPedido(data)

        setLoadingProductos(true)
        const agrupados = agruparProductos(data.productos)
        const idsUnicos = [...new Set(data.productos)]

        const resultados = await Promise.all(
          idsUnicos.map((pid) => SellerService.getProductById(pid))
        )

        const productosConCantidad: ProductoConCantidad[] = resultados
          .filter((p): p is NonNullable<typeof p> => p !== null)
          .map((p) => ({
            ...p,
            cantidad: agrupados.find((a) => a.id === p.id)?.cantidad ?? 1,
          }))

        setProductos(productosConCantidad)
      } catch {
        setError('No pudimos cargar el pedido. Intentá de nuevo.')
      } finally {
        setLoading(false)
        setLoadingProductos(false)
      }
    }

    fetchPedido()
  }, [isLoaded, isSignedIn, id, router])

  if (!isLoaded || loading) {
    return (
      <Flex justify="center" align="center" minH="60vh" role="status" aria-label="Cargando pedido">
        <Spinner color="brand.accent" size="lg" />
      </Flex>
    )
  }

  if (error || !pedido) {
    return (
      <Container maxW="container.md" py={8}>
        <Flex direction="column" align="center" gap={4} role="alert" aria-live="assertive">
          <Icon as={FaExclamationCircle} boxSize={10} color="brand.danger" aria-hidden="true" />
          <Text color="brand.textMuted">{error ?? 'Pedido no encontrado.'}</Text>
          <Box
            as="button"
            px={5} py={2}
            border="1px solid" borderColor="brand.border"
            borderRadius="lg" color="brand.textMain" fontSize="sm"
            _hover={{ borderColor: 'brand.accent', color: 'brand.accent' }}
            _focus={{ outline: '2px solid', outlineColor: 'brand.accent', outlineOffset: '2px' }}
            onClick={() => router.push('/pedidos')}
            aria-label="Volver a mis pedidos"
          >
            Volver a mis pedidos
          </Box>
        </Flex>
      </Container>
    )
  }

  const config = ESTADO_CONFIG[pedido.estado]

  return (
    <Container maxW="container.md" py={8} px={{ base: 4, md: 6 }}>
      <SkipLink />
      <main id="main-content">

        {/* Encabezado */}
        <Flex align="center" gap={3} mb={6}>
          <BackButton />
          <VStack align="start" gap={0}>
            <Text fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider">
              Detalle del pedido
            </Text>
            <Heading as="h1" size="lg" color="brand.textMain" fontFamily="mono">
              #{pedido.id}
            </Heading>
          </VStack>
          <HStack
            ml="auto" px={3} py={1}
            borderRadius="full"
            bg={config.bg}
            border="1px solid"
            borderColor={config.color}
            gap={1.5}
            flexShrink={0}
            role="status"
            aria-label={`Estado del pedido: ${config.label}`}
          >
            <Icon as={config.icon} color={config.color} boxSize={3} aria-hidden="true" />
            <Text fontSize="xs" fontWeight="semibold" color={config.color}>{config.label}</Text>
          </HStack>
        </Flex>

        {/* Barra de progreso */}
        <Box
          bg="brand.bgCard"
          border="1px solid"
          borderColor="brand.border"
          borderRadius="xl"
          p={5} mb={4}
        >
          <Text fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider" mb={4}>
            Progreso del pedido
          </Text>
          <BarraProgreso estado={pedido.estado} />
        </Box>

        {/* Productos */}
        <Box
          as="section"
          aria-labelledby="productos-heading"
          bg="brand.bgCard"
          border="1px solid"
          borderColor="brand.border"
          borderRadius="xl"
          p={5} mb={4}
        >
          <Text
            id="productos-heading"
            fontSize="xs"
            color="brand.textMuted"
            textTransform="uppercase"
            letterSpacing="wider"
            mb={3}
          >
            Productos
          </Text>

          {loadingProductos ? (
            <Flex justify="center" py={6} role="status" aria-label="Cargando productos">
              <Spinner color="brand.accent" size="sm" />
            </Flex>
          ) : productos.length > 0 ? (
            <Box as="ul" listStyleType="none" role="list" aria-label="Lista de productos del pedido">
              {productos.map((p) => (
                <ProductoRow key={p.id} producto={p} />
              ))}
            </Box>
          ) : (
            <Flex align="center" gap={2} py={4} color="brand.textMuted" role="status">
              <Icon as={FaBox} aria-hidden="true" />
              <Text fontSize="sm">{pedido.productos.length} producto(s) — detalle no disponible</Text>
            </Flex>
          )}

          <Flex
            justify="space-between" align="center"
            pt={4} mt={2}
            borderTop="1px solid" borderColor="brand.border"
          >
            <Text fontSize="sm" color="brand.textMuted" fontWeight="medium">Total del pedido</Text>
            <Text
              fontSize="2xl" fontWeight="black" color="brand.accent"
              aria-label={`Total: ${formatMonto(pedido.monto)}`}
            >
              {formatMonto(pedido.monto)}
            </Text>
          </Flex>
        </Box>

        {/* Info del pedido */}
        <Box
          as="section"
          aria-labelledby="info-heading"
          bg="brand.bgCard"
          border="1px solid"
          borderColor="brand.border"
          borderRadius="xl"
          p={5} mb={4}
        >
          <Text
            id="info-heading"
            fontSize="xs"
            color="brand.textMuted"
            textTransform="uppercase"
            letterSpacing="wider"
            mb={3}
          >
            Información del pedido
          </Text>
          <Grid templateColumns="1fr 1fr" gap={4}>
            <VStack align="start" gap={0}>
              <Text fontSize="xs" color="brand.textMuted">Fecha</Text>
              <Text fontSize="sm" color="brand.textMain" fontWeight="medium">
                <time dateTime={pedido.fecha}>{formatFechaConHora(pedido.fecha)}</time>
              </Text>
            </VStack>
            <VStack align="start" gap={0}>
              <Text fontSize="xs" color="brand.textMuted">Vendedor</Text>
              <Text fontSize="sm" color="brand.textMain" fontWeight="medium">#{pedido.vendedor_id}</Text>
            </VStack>
          </Grid>
        </Box>

        {/* Seguimiento */}
        {pedido.envio_id && (
          <SeguimientoSection
            envioId={pedido.envio_id}
            onVerDetalle={() => router.push(`/seguimiento_envio?pedidoId=${pedido.id}&envioId=${pedido.envio_id}`)}
          />
        )}

      </main>
    </Container>
  )
}