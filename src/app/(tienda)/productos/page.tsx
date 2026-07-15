import { Suspense } from 'react'
import { Metadata } from 'next'
import { ProductosLoading } from '@/components/productos/ProductosEstados'
import ProductosWrapper from './ProductosWrapper'

export const metadata: Metadata = {
  title: 'Productos | CoreHardware',
  description: 'Explorá nuestro catálogo de productos con filtros por marca y vendedor.',
}

interface PageProps {
  searchParams: Promise<{
    search?: string
    marca?: string
    vendedor?: string
    page?: string
  }>
}

export default async function ProductosPage({ searchParams }: PageProps) {
  const { search = '', marca = '', vendedor = '', page = '1' } = await searchParams

  return (
    <Suspense fallback={<ProductosLoading />}>
      <ProductosWrapper
        search={search}
        marca={marca}
        vendedor={vendedor}
        page={page}
      />
    </Suspense>
  )
}