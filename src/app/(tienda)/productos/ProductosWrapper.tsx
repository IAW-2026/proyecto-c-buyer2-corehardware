import ListadoProductos from './ListadoProductos'
import { ProductSummary } from '@/types/producto'
import { fetchSellerProducts } from '@/services/sellerService'

const LIMIT = 20

interface Props {
  search: string
  marca: string
  vendedor: string
  page: string
}

export default async function ProductosWrapper({ search, marca, vendedor, page }: Props) {
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