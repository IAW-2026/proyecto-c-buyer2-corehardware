'use client'

import { useCart } from '@/context/CartContext'
import { Button } from '@chakra-ui/react'
import { Producto } from '@/types/producto'

interface AddToCartButtonProps {
  producto: Producto
}

export function AddToCartButton({ producto }: AddToCartButtonProps) {
  const { agregar } = useCart()

  return (
    <Button 
      // El aria-label ayuda a los lectores de pantalla a ser más específicos
      aria-label={`Agregar ${producto.nombre} al carrito`}
      // Mantén el onClick intacto, es lo que hace que funcione
      onClick={() => agregar(producto)}
      // Estilos para que se vea como un botón real (Chakra UI)
      bg="brand.accent" 
      color="brand.bgMain" 
      w="full" 
      fontWeight="bold" 
      size="sm"
      _hover={{ bg: "gray.700", color: "white", transform: "scale(1.02)" }}
    >
      Agregar al carrito
    </Button>
  )
}