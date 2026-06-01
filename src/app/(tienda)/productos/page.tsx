import { Suspense } from 'react'
import ListadoProductos from './ListadoProductos'
import { Spinner } from '@chakra-ui/react'

export default function Page() {
  return (
    <Suspense fallback={<Spinner color="brand.accent" />}>
      <ListadoProductos />
    </Suspense>
  )
}