'use client'

import { useCart } from '@/context/CartContext'
import { Button } from '@chakra-ui/react'
import { Product, ProductSummary } from '@/types/producto'

interface AddToCartButtonProps {
  producto: Product | ProductSummary;
}

export function AddToCartButton({ producto }: AddToCartButtonProps) {
  const { agregar } = useCart()
  const handleAddToCart = () => {
    // Si el producto ya tiene 'vendedorId', es un Product completo.
    if ('vendedorId' in producto) {
      agregar(producto)
    } else {
      // Si es un ProductSummary, creamos un objeto 'Product' completo
      // rellenando lo que falta con valores que no afecten al carrito.
      const productoCompleto: Product = {
        ...producto,
        vendedorId: 0,           // Valor neutro técnico
        descripcion: "",         // Vacío: el carrito no lo usa
        especificaciones: "",    // Vacío: el carrito no lo usa
        garantia: ""            // Vacío: el carrito no lo usa
      }

      agregar(productoCompleto)
    }
  }
  return (
    <Button
      // El aria-label ayuda a los lectores de pantalla a ser más específicos
      aria-label={`Agregar ${producto.nombre} al carrito`}
      // Mantén el onClick intacto, es lo que hace que funcione
      onClick={handleAddToCart}
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