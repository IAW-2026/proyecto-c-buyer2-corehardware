'use client'

import { useCart } from '@/context/CartContext'
import { Button, Text, Icon } from '@chakra-ui/react'
import { ProductSummary } from '@/types/producto'
import { FaShoppingCart } from 'react-icons/fa'
import { toaster } from '@/components/ui/toaster'

interface AddToCartButtonProps {
  producto: ProductSummary
  isDetailView?: boolean
}

export function AddToCartButton({ producto, isDetailView }: AddToCartButtonProps) {
  const { agregar, items } = useCart()
  const vendedorDistinto = items.length > 0 && items[0].vendedorId !== producto.vendedorId

  const handleAddToCart = async () => {
    if (vendedorDistinto || producto.stock === 0) return
    await agregar(producto)
    toaster.create({
      title: '¡Producto agregado!',
      description: `${producto.nombre} fue agregado al carrito.`,
      type: 'success',
    })
  }

  return (
    <>
      <Button
        aria-label={`Agregar ${producto.nombre} al carrito`}
        onClick={handleAddToCart}
        bg="brand.accent"
        color="brand.bgMain"
        fontWeight="bold"
        size={isDetailView ? 'lg' : 'sm'}
        w={isDetailView ? { base: 'full', md: '300px' } : 'full'}
        px={isDetailView ? 10 : 0}
        disabled={vendedorDistinto || producto.stock === 0}
        title={vendedorDistinto ? 'Tu carrito tiene productos de otro vendedor' : undefined}
        _hover={{ bg: 'gray.700', color: 'white', transform: 'scale(1.02)' }}
      >
        {isDetailView && <Icon as={FaShoppingCart} mr={2} />}
        Agregar al carrito
      </Button>
      {vendedorDistinto && (
        <Text fontSize="xs" color="brand.danger" textAlign="center" mt={1}>
          Tu carrito es de otro vendedor
        </Text>
      )}
    </>
  )
}