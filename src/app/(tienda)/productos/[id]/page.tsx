import { SellerService } from '@/services/sellerService'
import { notFound } from 'next/navigation'
import DetalleProducto from './DetalleProducto'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const producto = await SellerService.getProductById(Number(id))
  if (!producto) notFound()
  return <DetalleProducto producto={producto} />
}