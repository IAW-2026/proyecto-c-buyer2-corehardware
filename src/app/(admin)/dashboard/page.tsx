// app/(admin)/dashboard/page.tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Container, Flex, Grid, Text, VStack } from '@chakra-ui/react'
import { getDashboardStats } from '@/lib/queries/admin'
import StatCard from '@/components/admin/StatCard'
import PedidosPanel from '@/components/admin/PedidosPanel'

export default async function DashboardPage() {
  const { userId, sessionClaims } = await auth()
  if (!userId) redirect('/sign-in')
  const role = (sessionClaims?.metadata as Record<string, unknown>)?.role
  if (role !== 'admin') redirect('/productos')

  const stats = await getDashboardStats()

  return (
    <Container maxW="container.xl" py={8} px={{ base: 4, md: 6 }}>

      <Flex align="center" justify="space-between" mb={8} wrap="wrap" gap={4}>
        <VStack align="start" gap={0}>
          <Text fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider">
            Panel de administración
          </Text>
          <Text fontSize="2xl" fontWeight="black" color="brand.textMain">
            Dashboard
          </Text>
        </VStack>
      </Flex>

      <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={4} mb={8} aria-label="Resumen de pedidos">
        <StatCard label="Total pedidos" value={stats.total}      color="brand.accent" />
        <StatCard label="Entregados"    value={stats.entregados} color="#34D399" />
        <StatCard label="En camino"     value={stats.enCamino}   color="#00D1FF" />
        <StatCard label="Pendientes"    value={stats.pendientes} color="#F0A500" />
      </Grid>

      <PedidosPanel />

    </Container>
  )
}