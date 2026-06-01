'use client'

import { useCart } from '@/context/CartContext'
import { Button, Text, Icon } from '@chakra-ui/react'
import { ProductSummary } from '@/types/producto'
import { FaShoppingCart } from 'react-icons/fa';

interface AddToCartButtonProps {
  producto: ProductSummary;
  isDetailView?: boolean; // Para saber si estamos en la vista detalle o listado  
}

export function AddToCartButton({ producto, isDetailView }: AddToCartButtonProps) {
  const { agregar, items } = useCart()
  const vendedorDistinto = items.length > 0 && items[0].vendedorId !== producto.vendedorId;
  const handleAddToCart = () => {
    agregar(producto)
  }
  return (
    <>
      <Button
        // El aria-label ayuda a los lectores de pantalla a ser más específicos
        aria-label={`Agregar ${producto.nombre} al carrito`}
        // Mantén el onClick intacto, es lo que hace que funcione
        onClick={handleAddToCart}
        // Estilos para que se vea como un botón real (Chakra UI)
        bg="brand.accent"
        color="brand.bgMain"
        fontWeight="bold"
        // Si es vista detalle, que sea grande, si es listado, manténlo normal
        size={isDetailView ? "lg" : "sm"}
        // Ancho inteligente:
        w={isDetailView ? { base: "full", md: "300px" } : "full"}
        px={isDetailView ? 10 : 0}
        // En el Button, agregás:
        disabled={vendedorDistinto || producto.stock === 0}
        title={vendedorDistinto ? 'Tu carrito tiene productos de otro vendedor' : undefined}
        _hover={{ bg: "gray.700", color: "white", transform: "scale(1.02)" }}
      >
        {/* Si es vista detalle, renderizamos el icono manualmente */}
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