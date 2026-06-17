'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'
import { useAuth } from '@clerk/nextjs'
import { ProductSummary } from '@/types/producto'
import { CartItem } from '@/types/carrito'

interface CartContextType {
  items: CartItem[]
  loading: boolean
  agregar: (producto: ProductSummary) => Promise<void>
  remover: (id: number) => Promise<void>
  incrementarCantidad: (id: number) => Promise<void>
  decrementarCantidad: (id: number) => Promise<void>
  limpiarCarrito: () => Promise<void>
  totalItems: number
  subtotalProductos: number
  costoEnvio: number
  total: number
}

export const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  // ── Cargar carrito desde Neon al hacer login ─────────────────────────────
  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      setItems([])
      return
    }

    const cargarCarrito = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/carrito')
        if (!res.ok) return
        const data = await res.json()
        // Mapear CarritoItem de Neon a CartItem del contexto
        const itemsMapeados: CartItem[] = data.items.map((item: any) => ({
          id: item.productoId,
          carritoItemId: item.id,
          nombre: item.nombre,
          precio: item.precio,
          imagen: item.imagen,
          cantidad: item.cantidad,
          vendedorId: item.vendedorId,
          marca: '',
          modelo: '',
          stock: 0,
          vendedor: '',
        }))
        setItems(itemsMapeados)
      } catch (err) {
        console.error('Error cargando carrito:', err)
      } finally {
        setLoading(false)
      }
    }

    cargarCarrito()
  }, [isSignedIn, isLoaded])

  // ── Cálculos ─────────────────────────────────────────────────────────────
  const totalItems = useMemo(() =>
    items.reduce((acc, item) => acc + item.cantidad, 0), [items])

  const subtotalProductos = useMemo(() =>
    items.reduce((acc, item) => acc + item.precio * (item.cantidad || 1), 0), [items])

  const costoEnvio = useMemo(() =>
    (subtotalProductos === 0 || subtotalProductos > 500000) ? 0 : 8500, [subtotalProductos])

  const total = useMemo(() =>
    subtotalProductos + costoEnvio, [subtotalProductos, costoEnvio])

  // ── Acciones ─────────────────────────────────────────────────────────────
  const agregar = async (producto: ProductSummary) => {
    if (items.length > 0 && items[0].vendedorId !== producto.vendedorId) return

    if (!isSignedIn) {
      // Sin login: solo actualizar estado React, sin persistir en Neon
      setItems(prev => {
        const existe = prev.find(i => i.id === producto.id)
        if (existe) {
          return prev.map(i => i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i)
        }
        return [...prev, { ...producto, cantidad: 1 }]
      })
      return
    }

    try {
      const res = await fetch('/api/carrito/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productoId: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          imagen: producto.imagen,
          cantidad: 1,
          vendedorId: producto.vendedorId,
        }),
      })
      if (!res.ok) return
      const itemGuardado = await res.json()

      setItems(prev => {
        const existe = prev.find(i => i.id === producto.id)
        if (existe) {
          return prev.map(i =>
            i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i
          )
        }
        return [...prev, {
          ...producto,
          cantidad: 1,
          carritoItemId: itemGuardado.id,
        }]
      })
    } catch (err) {
      console.error('Error agregando al carrito:', err)
    }
  }

  const remover = async (id: number) => {
    if (!isSignedIn) {
      setItems(prev => prev.filter(i => i.id !== id))
      return
    }
    const item = items.find(i => i.id === id)
    if (!item?.carritoItemId) return
    try {
      await fetch(`/api/carrito/items/${item.carritoItemId}`, { method: 'DELETE' })
      setItems(prev => prev.filter(i => i.id !== id))
    } catch (err) {
      console.error('Error removiendo item:', err)
    }
  }

  const incrementarCantidad = async (id: number) => {
    if (!isSignedIn) {
      setItems(prev => prev.map(i => i.id === id ? { ...i, cantidad: i.cantidad + 1 } : i))
      return
    }
    const item = items.find(i => i.id === id)
    if (!item?.carritoItemId) return
    const nuevaCantidad = item.cantidad + 1
    try {
      await fetch(`/api/carrito/items/${item.carritoItemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidad: nuevaCantidad }),
      })
      setItems(prev => prev.map(i => i.id === id ? { ...i, cantidad: nuevaCantidad } : i))
    } catch (err) {
      console.error('Error incrementando cantidad:', err)
    }
  }

  const decrementarCantidad = async (id: number) => {
    if (!isSignedIn) {
      setItems(prev => prev.map(i => i.id === id && i.cantidad > 1 ? { ...i, cantidad: i.cantidad - 1 } : i))
      return
    }
    const item = items.find(i => i.id === id)
    if (!item?.carritoItemId || item.cantidad <= 1) return
    const nuevaCantidad = item.cantidad - 1
    try {
      await fetch(`/api/carrito/items/${item.carritoItemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidad: nuevaCantidad }),
      })
      setItems(prev => prev.map(i => i.id === id ? { ...i, cantidad: nuevaCantidad } : i))
    } catch (err) {
      console.error('Error decrementando cantidad:', err)
    }
  }

  const limpiarCarrito = async () => {
    try {
      await fetch('/api/carrito', { method: 'DELETE' })
      setItems([])
    } catch (err) {
      console.error('Error limpiando carrito:', err)
    }
  }

  return (
    <CartContext.Provider value={{
      items, loading, agregar, remover, incrementarCantidad, decrementarCantidad,
      limpiarCarrito, totalItems, subtotalProductos, costoEnvio, total,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart debe usarse dentro de un CartProvider')
  return context
}