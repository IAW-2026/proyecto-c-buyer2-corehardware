import { notFound } from 'next/navigation'
import DetalleProducto from './DetalleProducto'
import { fetchSellerProductById } from '@/services/sellerService'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const producto = await fetchSellerProductById(id)
  if (!producto) notFound()

  return <DetalleProducto producto={producto} />
}