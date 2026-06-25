'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import PaginationAdmin from '@/components/PaginationAdmin'

interface Props {
  totalItems: number
  limit: number
  offset: number
}

export default function CompradoresPaginacion({ totalItems, limit, offset }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handlePageChange = (newOffset: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('offset', String(newOffset))
    router.push(`${pathname}?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <PaginationAdmin
      totalItems={totalItems}
      limit={limit}
      offset={offset}
      onPageChange={handlePageChange}
    />
  )
}