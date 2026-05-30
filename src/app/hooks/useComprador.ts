import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'

export interface Comprador {
  id: number
  nombre: string
  apellido: string
  dni: string
  cuilCuit: string
  mail: string
  celular: string
  direccion: string
  fechaNacimiento: string
  nacionalidad: string
  sexo: string
  condicionIva: string
}

export function useComprador() {
  const { isSignedIn, isLoaded } = useAuth()
  const [comprador, setComprador] = useState<Comprador | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    setLoading(true)
    fetch('/api/perfil')
      .then((r) => {
        if (!r.ok) throw new Error('Perfil no encontrado')
        return r.json()
      })
      .then((data) => setComprador(data))
      .catch(() => setError('No se pudo cargar el perfil'))
      .finally(() => setLoading(false))
  }, [isLoaded, isSignedIn])

  return { comprador, loading, error }
}