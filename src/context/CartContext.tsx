'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
} from 'react'
import { useAuth } from '@clerk/nextjs'
import { ProductSummary } from '@/types/producto'
import { CartItem } from '@/types/carrito'
import { calcularCostoEnvio } from '@/lib/envio'

interface CartContextType {
  items: CartItem[]
  loading: boolean
  agregar: (producto: ProductSummary) => Promise<void>
  remover: (id: string) => Promise<void>
  incrementarCantidad: (id: string) => Promise<void>
  decrementarCantidad: (id: string) => Promise<void>
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

  // ── Ref para leer items sin dep en callbacks ──────────────────────────────
  const itemsRef = useRef(items)
  useEffect(() => {
    itemsRef.current = items
  }, [items])

  // ── Cargar carrito desde Neon al hacer login ──────────────────────────────
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

  // ── Cálculos memorizados ──────────────────────────────────────────────────
  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + item.cantidad, 0),
    [items]
  )

  const subtotalProductos = useMemo(
    () => items.reduce((acc, item) => acc + item.precio * (item.cantidad || 1), 0),
    [items]
  )

  const costoEnvio = useMemo(
    () => calcularCostoEnvio(subtotalProductos),
    [subtotalProductos]
  )

  const total = useMemo(
    () => subtotalProductos + costoEnvio,
    [subtotalProductos, costoEnvio]
  )

  // ── Acciones estabilizadas con useCallback ────────────────────────────────
  const agregar = useCallback(async (producto: ProductSummary) => {
    const currentItems = itemsRef.current
    if (currentItems.length > 0 && currentItems[0].vendedorId !== producto.vendedorId) return

    if (!isSignedIn) {
      setItems(prev => {
        const existe = prev.find(i => i.id === producto.id)
        if (existe) {
          return prev.map(i =>
            i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i
          )
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
        return [...prev, { ...producto, cantidad: 1, carritoItemId: itemGuardado.id }]
      })
    } catch (err) {
      console.error('Error agregando al carrito:', err)
    }
  }, [isSignedIn])

  const remover = useCallback(async (id: string) => {
    if (!isSignedIn) {
      setItems(prev => prev.filter(i => i.id !== id))
      return
    }
    const item = itemsRef.current.find(i => i.id === id)
    if (!item?.carritoItemId) return
    try {
      await fetch(`/api/carrito/items/${item.carritoItemId}`, { method: 'DELETE' })
      setItems(prev => prev.filter(i => i.id !== id))
    } catch (err) {
      console.error('Error removiendo item:', err)
    }
  }, [isSignedIn])

  const incrementarCantidad = useCallback(async (id: string) => {
    if (!isSignedIn) {
      setItems(prev =>
        prev.map(i => i.id === id ? { ...i, cantidad: i.cantidad + 1 } : i)
      )
      return
    }
    const item = itemsRef.current.find(i => i.id === id)
    if (!item?.carritoItemId) return
    const nuevaCantidad = item.cantidad + 1
    try {
      await fetch(`/api/carrito/items/${item.carritoItemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidad: nuevaCantidad }),
      })
      setItems(prev =>
        prev.map(i => i.id === id ? { ...i, cantidad: nuevaCantidad } : i)
      )
    } catch (err) {
      console.error('Error incrementando cantidad:', err)
    }
  }, [isSignedIn])

  const decrementarCantidad = useCallback(async (id: string) => {
    if (!isSignedIn) {
      setItems(prev =>
        prev.map(i =>
          i.id === id && i.cantidad > 1 ? { ...i, cantidad: i.cantidad - 1 } : i
        )
      )
      return
    }
    const item = itemsRef.current.find(i => i.id === id)
    if (!item?.carritoItemId || item.cantidad <= 1) return
    const nuevaCantidad = item.cantidad - 1
    try {
      await fetch(`/api/carrito/items/${item.carritoItemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidad: nuevaCantidad }),
      })
      setItems(prev =>
        prev.map(i => i.id === id ? { ...i, cantidad: nuevaCantidad } : i)
      )
    } catch (err) {
      console.error('Error decrementando cantidad:', err)
    }
  }, [isSignedIn])

  const limpiarCarrito = useCallback(async () => {
    try {
      await fetch('/api/carrito', { method: 'DELETE' })
      setItems([])
    } catch (err) {
      console.error('Error limpiando carrito:', err)
    }
  }, [])

  // ── Value estabilizado ────────────────────────────────────────────────────
  const contextValue = useMemo(
    () => ({
      items,
      loading,
      agregar,
      remover,
      incrementarCantidad,
      decrementarCantidad,
      limpiarCarrito,
      totalItems,
      subtotalProductos,
      costoEnvio,
      total,
    }),
    [
      items,
      loading,
      agregar,
      remover,
      incrementarCantidad,
      decrementarCantidad,
      limpiarCarrito,
      totalItems,
      subtotalProductos,
      costoEnvio,
      total,
    ]
  )

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart debe usarse dentro de un CartProvider')
  return context
}