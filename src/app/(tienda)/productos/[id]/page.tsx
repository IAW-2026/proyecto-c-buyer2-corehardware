import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import DetalleProducto from './DetalleProducto'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const requestHeaders = await headers()
  const host = requestHeaders.get('host') ?? 'localhost:3000'
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'

  const res = await fetch(`${protocol}://${host}/api/seller/products/${id}`, {
    cache: 'no-store',
  })

  if (!res.ok) notFound()

  const producto = await res.json()

  return <DetalleProducto producto={producto} />
}