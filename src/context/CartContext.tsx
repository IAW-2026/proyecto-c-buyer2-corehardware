'use client'

import { createContext, useContext, useState, ReactNode, useMemo } from 'react'
import { Producto } from '@/types/producto'
import { CartItem } from '@/types/carrito'

interface CartContextType {
  items: CartItem[]
  agregar: (producto: Producto) => void
  remover: (id: number) => void
  totalItems: number 
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  //  Calculamos el total usando useMemo para que solo se recalcule cuando 'items' cambie
  const totalItems = useMemo(() => {
    return items.reduce((acc, item) => acc + item.cantidad, 0)
  }, [items])

  const agregar = (producto: Producto) => {
    setItems(prev => {
      const existe = prev.find(i => i.id === producto.id)
      if (existe) {
        return prev.map(i => i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i)
      }
      return [...prev, { ...producto, cantidad: 1 }]
    })
  }

  const remover = (id: number) => setItems(prev => prev.filter(i => i.id !== id))

  return (
    // Pasamos 'totalItems' al value para que esté disponible en toda la app
    <CartContext.Provider value={{ items, agregar, remover, totalItems }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart debe usarse dentro de un CartProvider")
  return context
}