'use client'

import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import { brandColors } from '@/styles/colors'
import { useState, useEffect } from 'react'

export function NotFoundViewLink() {
  const { sessionClaims, isLoaded } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isLoaded) return null

  const role = (sessionClaims?.metadata as any)?.role
  const isAdmin = role === 'admin'

  return (
    <Link
      href={isAdmin ? '/dashboard' : '/productos'}
      style={{
        padding: '12px 24px',
        background: brandColors.accent,
        color: brandColors.bgMain,
        borderRadius: '8px',
        fontWeight: 'bold',
        fontSize: '14px',
        textDecoration: 'none',
      }}
      aria-label={isAdmin ? 'Ir al dashboard' : 'Ir al catálogo de productos'}
    >
      {isAdmin ? 'Ir al dashboard' : 'Ver productos'}
    </Link>
  )
}