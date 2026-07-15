import { Suspense } from 'react'
import NotFoundView from '@/components/errors/NotFoundView'

export default function NotFound() {
  return (
    <Suspense>
      <NotFoundView />
    </Suspense>
  )
}