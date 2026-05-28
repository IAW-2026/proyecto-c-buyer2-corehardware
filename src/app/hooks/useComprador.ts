import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'

interface Comprador {
  id: number
  nombre: string
  apellido: string
  mail: string
  perfilCompleto: boolean
}

export function useComprador() {
  const { userId, isSignedIn } = useAuth()
  const [comprador, setComprador] = useState<Comprador | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isSignedIn) return
    setLoading(true)
    fetch('/api/comprador/me')
      .then((r) => r.json())
      .then((data) => setComprador(data))
      .finally(() => setLoading(false))
  }, [isSignedIn])

  return { comprador, loading }
}