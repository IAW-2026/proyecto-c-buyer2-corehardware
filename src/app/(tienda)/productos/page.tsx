import { Suspense } from 'react'
import { Metadata } from 'next'
import { ProductosLoading } from '@/components/productos/ProductosEstados'
import ListadoProductos from './ListadoProductos'
import { ProductSummary } from '@/types/producto'
import { fetchSellerProducts } from '@/services/sellerService'  // ← directo

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

const LIMIT = 20

export default async function ProductosPage({ searchParams }: PageProps) {
  const { search = '', marca = '', vendedor = '', page = '1' } = await searchParams
  const currentPage = Math.max(Number(page) || 1, 1)
  const offset = (currentPage - 1) * LIMIT

  const params = new URLSearchParams()
  params.set('offset', String(offset))
  params.set('limit', String(LIMIT))
  params.set('hasStock', 'true')
  if (search)   params.set('name', search)
  if (marca)    params.set('brand', marca)
  if (vendedor) params.set('seller', vendedor)

  const opcionesParams = new URLSearchParams()
  opcionesParams.set('offset', '0')
  opcionesParams.set('limit', '200')
  opcionesParams.set('hasStock', 'true')

  const [data, opciones] = await Promise.all([
    fetchSellerProducts(params),
    fetchSellerProducts(opcionesParams),
  ])

  const todasLasMarcas = [...new Set(
    (opciones.items as ProductSummary[]).map((p) => p.marca).filter(Boolean)
  )].sort() as string[]

  const todosLosVendedores = [...new Set(
    (opciones.items as ProductSummary[]).map((p) => p.vendedor).filter(Boolean)
  )].sort() as string[]

  return (
      <ListadoProductos
        items={data.items}
        total={data.total}
        offset={offset}
        search={search}
        marca={marca}
        vendedor={vendedor}
        todasLasMarcas={todasLasMarcas}
        todosLosVendedores={todosLosVendedores}
      />
  )
}