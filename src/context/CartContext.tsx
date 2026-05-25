'use client'

import { createContext, useContext, useState, ReactNode, useMemo } from 'react'
import { Product } from '@/types/producto'
import { CartItem } from '@/types/carrito'

interface CartContextType {
  items: CartItem[]
  agregar: (producto: Product) => void
  remover: (id: number) => void
  incrementarCantidad: (id: number) => void
  decrementarCantidad: (id: number) => void
  limpiarCarrito: () => void
  totalItems: number
  subtotalProductos: number
  costoEnvio: number
  total: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const totalItems = useMemo(() => {
    return items.reduce((acc, item) => acc + item.cantidad, 0)
  }, [items])

  const subtotalProductos = useMemo(() => {
    return items.reduce((acc, item) => acc + item.precio * (item.cantidad || 1), 0)
  }, [items])

  const costoEnvio = useMemo(() => {
    return (subtotalProductos === 0 || subtotalProductos > 500000) ? 0 : 8500
  }, [subtotalProductos])

  const total = useMemo(() => {
    return subtotalProductos + costoEnvio
  }, [subtotalProductos, costoEnvio])

  const agregar = (producto: Product) => {
    setItems(prev => {
      const existe = prev.find(i => i.id === producto.id)
      if (existe) {
        return prev.map(i => i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i)
      }
      return [...prev, { ...producto, Math: 1, cantidad: 1 }]
    })
  }

  const remover = (id: number) => setItems(prev => prev.filter(i => i.id !== id))

  const limpiarCarrito = () => {
    setItems([])
  }

  const incrementarCantidad = (id: number) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item
      )
    )
  }

  const decrementarCantidad = (id: number) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id && item.cantidad > 1
          ? { ...item, cantidad: item.cantidad - 1 }
          : item
      )
    )
  }

  return (
    // 4. Pasamos las dos nuevas funciones al Provider para que tus pantallas puedan usarlas
    <CartContext.Provider value={{  
      items, agregar, remover, incrementarCantidad, decrementarCantidad, limpiarCarrito, totalItems, subtotalProductos, costoEnvio, total }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart debe usarse dentro de un CartProvider")
  return context
}