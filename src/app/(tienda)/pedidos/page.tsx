import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Container, Flex, Grid, Heading, Text, VStack } from '@chakra-ui/react'
import { BackButton } from '@/components/ui/BackButton'
import { SkipLink } from '@/components/ui/SkipLink'
import { PedidoCard } from '@/components/pedidos/PedidoCard'
import { EmptyState } from '@/components/pedidos/PedidosEstados'
import PedidosPaginacion from '@/components/pedidos/PedidosPaginacion'
import { Pedido } from '@/types/pedido'
import { fetchSellerById } from '@/services/sellerService'

const LIMIT = 8

interface PageProps {
  searchParams: Promise<{ offset?: string }>
}

export default async function PedidosPage({ searchParams }: PageProps) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?redirectUrl=/pedidos')

  const { offset: offsetParam = '0' } = await searchParams
  const offset = Math.max(Number(offsetParam) || 0, 0)

  const comprador = await prisma.comprador.findUnique({ where: { clerkUserId: userId } })
  if (!comprador || comprador.isDeleted) redirect('/sign-in')

  const [pedidosDB, total] = await Promise.all([
    prisma.pedido.findMany({
      where: { compradorId: comprador.id },
      orderBy: { fecha: 'desc' },
      take: LIMIT,
      skip: offset,
    }),
    prisma.pedido.count({ where: { compradorId: comprador.id } }),
  ])

  const vendedorIds = [...new Set(pedidosDB.map((p) => p.vendedorId))]
  const vendedorResults = await Promise.all(
    vendedorIds.map((id) => fetchSellerById(id))
  )
  const vendedorMap = Object.fromEntries(
    vendedorIds.map((id, i) => [id, vendedorResults[i]?.razon_social ?? null])
  )

  const pedidos: Pedido[] = pedidosDB.map((p) => ({
    id:              p.id,
    fecha:           p.fecha.toISOString(),
    comprador_id:    p.compradorId,
    vendedor_id:     p.vendedorId,
    vendedor_nombre: vendedorMap[p.vendedorId],
    productos:       p.productosId,
    monto:           p.monto,
    estado:          p.estado as Pedido['estado'],
    envio_id:        p.envioId ?? null,
  }))

  return (
    <Container maxW="container.xl" py={8} px={{ base: 4, md: 6 }}>
      <SkipLink />
      <main id="main-content">
        <Flex align="center" gap={3} mb={8}>
          <BackButton href="/" />
          <VStack align="start" gap={0}>
            <Heading as="h1" size="xl" color="brand.textMain">Mis Pedidos</Heading>
            {total > 0 && (
              <Text color="brand.textMuted" fontSize="sm">
                {total} {total === 1 ? 'pedido encontrado' : 'pedidos encontrados'}
              </Text>
            )}
          </VStack>
        </Flex>

        {pedidos.length === 0 ? (
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
              <PedidosPaginacion totalItems={total} limit={LIMIT} offset={offset} />
            )}
          </>
        )}
      </main>
    </Container>
  )
}