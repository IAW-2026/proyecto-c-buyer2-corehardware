'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { Box, Container, Flex, Grid, Heading, Text, VStack, Spinner } from '@chakra-ui/react'
import { BackButton } from '@/components/ui/BackButton'
import { SkipLink } from '@/components/ui/SkipLink'
import Pagination from '@/components/Pagination'
import { Pedido, PedidosResponse } from '@/types/pedido'
import { PedidoCard } from '@/components/pedidos/PedidoCard'
import { EmptyState, ErrorState } from '@/components/pedidos/PedidosEstados'

const LIMIT = 8

// ── Página principal ───────────────────────────────────────────────────────

export default function PedidosPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()

  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPedidos = useCallback(async (newOffset: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/orders?limit=${LIMIT}&offset=${newOffset}`)
      if (!res.ok) throw new Error('Error al cargar los pedidos')
      const data: PedidosResponse = await res.json()
      setPedidos(data.items)
      setTotal(data.total)
    } catch {
      setError('No pudimos cargar tus pedidos. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      router.push('/sign-in?redirectUrl=/pedidos')
      return
    }
    fetchPedidos(offset)
  }, [isLoaded, isSignedIn, offset, fetchPedidos, router])

  const handlePageChange = (newOffset: number) => {
    setOffset(newOffset)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!isLoaded) {
    return (
      <>
        <Flex
          justify="center"
          align="center"
          minH="60vh"
          role="status"
          aria-label="Verificando sesión"
        >
          <Spinner color="brand.accent" size="lg" />
        </Flex>
      </>
    )
  }

  return (
    <>
      <Container maxW="container.xl" py={8} px={{ base: 4, md: 6 }}>
        <SkipLink />
        <main id="main-content">
          <Flex align="center" gap={3} mb={8}>
            <BackButton href="/" />
            <VStack align="start" gap={0}>
              <Heading as="h1" size="xl" color="brand.textMain">Mis Pedidos</Heading>
              {!loading && total > 0 && (
                <Text color="brand.textMuted" fontSize="sm" aria-live="polite">
                  {total} {total === 1 ? 'pedido encontrado' : 'pedidos encontrados'}
                </Text>
              )}
            </VStack>
          </Flex>

          {loading ? (
            <Flex
              justify="center"
              align="center"
              minH="40vh"
              role="status"
              aria-label="Cargando pedidos"
              aria-live="polite"
            >
              <VStack gap={3}>
                <Spinner color="brand.accent" size="lg" />
                <Text color="brand.textMuted" fontSize="sm">Cargando pedidos...</Text>
              </VStack>
            </Flex>

          ) : error ? (
            <ErrorState error={error} onRetry={() => fetchPedidos(offset)} />

          ) : pedidos.length === 0 ? (
            <EmptyState />

          ) : (
            <>
              <Grid
                as="section"
                aria-label={`Lista de pedidos, página ${Math.floor(offset / LIMIT) + 1}`}
                templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }}
                gap={4}
              >
                {pedidos.map((pedido) => (
                  <PedidoCard key={pedido.id} pedido={pedido} />
                ))}
              </Grid>

              {total > LIMIT && (
                <Pagination
                  totalItems={total}
                  limit={LIMIT}
                  offset={offset}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </main>
      </Container>
    </>
  )
}