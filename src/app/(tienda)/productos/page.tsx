import { Suspense } from 'react'
import { Metadata } from 'next'
import ListadoProductos from './ListadoProductos'
import { ProductosLoading } from '@/components/productos/ProductosEstados'

export const metadata: Metadata = {
  title: 'Productos | [Tu Marca]',
  description: 'Explorá nuestro catálogo de productos con filtros por marca y vendedor.',
}

export default function Page() {
  return (
    <Suspense fallback={<ProductosLoading />}>
      <ListadoProductos />
    </Suspense>
  )
}