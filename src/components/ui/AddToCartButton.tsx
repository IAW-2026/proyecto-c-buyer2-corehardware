'use client'

import { memo, useState, useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import { ProductSummary } from '@/types/producto'
import { Box, Flex, Icon, Text, Spinner } from '@chakra-ui/react'
import { FaPlus, FaMinus, FaShoppingCart, FaTrash } from 'react-icons/fa'
import { formatPrecio } from '@/utils/formatPrecio'

interface AddToCartButtonProps {
  producto: ProductSummary
  isDetailView?: boolean
}

export const AddToCartButton = memo(function AddToCartButton({
  producto,
  isDetailView = false,
}: AddToCartButtonProps) {
  const { items, agregar, incrementarCantidad, decrementarCantidad, remover } = useCart()
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const itemEnCarrito = items.find(i => i.id === producto.id)
  const cantidad = itemEnCarrito?.cantidad ?? 0
  const estaEnCarrito = cantidad > 0
  const vendedorDistinto = items.length > 0 && items[0].vendedorId !== producto.vendedorId

  const handleAgregar = async () => {
    if (vendedorDistinto || loading) return
    setLoading(true)
    try { await agregar(producto) }
    finally { setLoading(false) }
  }

  const handleIncrementar = async () => {
    if (loading || cantidad >= producto.stock) return
    setLoading(true)
    try { await incrementarCantidad(producto.id) }
    finally { setLoading(false) }
  }

  const handleDecrementar = async () => {
    if (loading) return
    setLoading(true)
    try {
      if (cantidad === 1) await remover(producto.id)
      else await decrementarCantidad(producto.id)
    } finally {
      setLoading(false)
    }
  }

  const maxAlcanzado = cantidad >= producto.stock

  // ── Render estático hasta que el cliente monta ────────────────────────────
  if (!mounted) {
    return (
      <Box
        w="full" py={3} px={4}
        bg="brand.accent" color="brand.bgMain"
        borderRadius="lg" textAlign="center"
        opacity={0.7}
        display="flex" alignItems="center" justifyContent="center"
        gap={2}
      >
        <Icon as={FaShoppingCart} boxSize={3.5} />
        <Text fontSize="sm" fontWeight="bold">Agregar al carrito</Text>
      </Box>
    )
  }

  // ── Renders post-mount (dependen del estado del carrito) ──────────────────

  if (vendedorDistinto) {
    return (
      <Box
        w="full" py={3} px={4}
        bg="rgba(248,81,73,0.08)"
        border="1px solid" borderColor="brand.danger"
        borderRadius="lg" textAlign="center"
        cursor="not-allowed"
        aria-disabled="true"
        title="Tu carrito tiene productos de otro vendedor"
      >
        <Text fontSize="sm" color="brand.danger" fontWeight="semibold">
          Vendedor distinto
        </Text>
      </Box>
    )
  }

  if (producto.stock === 0) {
    return (
      <Box
        w="full" py={3} px={4}
        bg="rgba(160,160,160,0.08)"
        border="1px solid" borderColor="gray.600"
        borderRadius="lg" textAlign="center"
        cursor="not-allowed"
        aria-disabled="true"
      >
        <Text fontSize="sm" color="gray.400" fontWeight="semibold">
          Sin stock
        </Text>
      </Box>
    )
  }

  if (!estaEnCarrito) {
    return (
      <Box
        as="button"
        onClick={handleAgregar}
        aria-disabled={loading}
        display="flex" alignItems="center" justifyContent="center"
        gap={2} w="full" py={3} px={4}
        bg="brand.accent" color="brand.bgMain"
        borderRadius="lg" fontWeight="bold" fontSize="sm"
        transition="all 0.2s"
        _hover={{ opacity: loading ? 1 : 0.85 }}
        _focus={{ outline: '2px solid', outlineColor: 'brand.accent', outlineOffset: '2px' }}
        cursor={loading ? 'wait' : 'pointer'}
        aria-label={`Agregar ${producto.nombre} al carrito`}
      >
        {loading ? <Spinner size="xs" /> : <Icon as={FaShoppingCart} boxSize={3.5} />}
        <Text fontSize="sm" fontWeight="bold">Agregar al carrito</Text>
      </Box>
    )
  }

  return (
    <Box w="full">
      <Flex align="center" w="full" gap={2}>
        <Box
          as="button" onClick={handleDecrementar}
          aria-disabled={loading}
          flexShrink={0}
          w={isDetailView ? '42px' : '36px'}
          h={isDetailView ? '42px' : '36px'}
          display="flex" alignItems="center" justifyContent="center"
          borderRadius="md" border="1px solid"
          borderColor={cantidad === 1 ? 'brand.danger' : 'brand.border'}
          color={cantidad === 1 ? 'brand.danger' : 'brand.textMuted'}
          _hover={cantidad === 1
            ? { bg: 'rgba(248,81,73,0.12)', borderColor: 'brand.danger' }
            : { borderColor: 'brand.accent', color: 'brand.accent' }
          }
          transition="all 0.15s"
          cursor={loading ? 'wait' : 'pointer'}
          aria-label={cantidad === 1 ? `Quitar ${producto.nombre} del carrito` : `Restar una unidad de ${producto.nombre}`}
          title={cantidad === 1 ? 'Quitar del carrito' : 'Restar unidad'}
        >
          {loading ? <Spinner size="xs" /> : <Icon as={cantidad === 1 ? FaTrash : FaMinus} boxSize={3} />}
        </Box>

        <Box
          flex={1} textAlign="center"
          bg="brand.bgMain" border="1px solid" borderColor="brand.border"
          borderRadius="md"
          h={isDetailView ? '42px' : '36px'}
          display="flex" alignItems="center" justifyContent="center"
        >
          <Text
            fontWeight="black" color="brand.accent"
            fontSize={isDetailView ? 'lg' : 'md'}
            aria-live="polite" aria-label={`Cantidad: ${cantidad}`}
          >
            {cantidad}
          </Text>
        </Box>

        <Box
          as="button" onClick={handleIncrementar}
          aria-disabled={loading || maxAlcanzado}
          flexShrink={0}
          w={isDetailView ? '42px' : '36px'}
          h={isDetailView ? '42px' : '36px'}
          display="flex" alignItems="center" justifyContent="center"
          borderRadius="md" border="1px solid" borderColor="brand.border"
          color="brand.textMuted"
          opacity={maxAlcanzado ? 0.4 : 1}
          cursor={loading || maxAlcanzado ? 'not-allowed' : 'pointer'}
          _hover={maxAlcanzado ? {} : { borderColor: 'brand.accent', color: 'brand.accent' }}
          transition="all 0.15s"
          aria-label={`Sumar una unidad de ${producto.nombre}`}
          title={maxAlcanzado ? 'Stock máximo alcanzado' : 'Sumar unidad'}
        >
          {loading ? <Spinner size="xs" /> : <Icon as={FaPlus} boxSize={3} />}
        </Box>
      </Flex>

      {isDetailView && (
        <Box mt={3}>
          <Text
            fontSize="sm" color="brand.textMuted"
            aria-label={`Subtotal: ${formatPrecio(producto.precio * cantidad)}`}
          >
            Subtotal:{' '}
            <Text as="span" fontWeight="bold" color="brand.textMain" fontSize="md">
              {formatPrecio(producto.precio * cantidad)}
            </Text>
          </Text>
        </Box>
      )}
    </Box>
  )
})