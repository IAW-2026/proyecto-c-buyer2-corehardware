import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Box, Container, Flex, Text, VStack } from '@chakra-ui/react'
import BuscadorCompradores from '@/components/admin/BuscadorCompradores'
import BuyerRow from '@/components/admin/BuyerRow'
import CompradoresPaginacion from '@/components/admin/CompradoresPaginacion'
import { EmptyStateCompradores } from '@/components/admin/MedalIcon'

const LIMIT = 10

interface PageProps {
  searchParams: Promise<{ search?: string; offset?: string }>
}

export default async function CompradoresPage({ searchParams }: PageProps) {
  const { userId, sessionClaims } = await auth()
  if (!userId) redirect('/sign-in')
  const role = (sessionClaims?.metadata as Record<string, unknown>)?.role
  if (role !== 'admin') redirect('/productos')

  const { search = '', offset: offsetParam = '0' } = await searchParams
  const offset = Math.max(Number(offsetParam) || 0, 0)

  const where = {
    isDeleted: false,
    ...(search ? {
      OR: [
        { nombre:   { contains: search, mode: 'insensitive' as const } },
        { apellido: { contains: search, mode: 'insensitive' as const } },
        { mail:     { contains: search, mode: 'insensitive' as const } },
        { dni:      { contains: search, mode: 'insensitive' as const } },
      ],
    } : {}),
  }

  const [compradores, total] = await Promise.all([
    prisma.comprador.findMany({
      where,
      orderBy: { apellido: 'asc' },
      take: LIMIT,
      skip: offset,
      select: {
        id: true, nombre: true, apellido: true, mail: true,
        dni: true, cuilCuit: true, celular: true, direccion: true,
        nacionalidad: true, sexo: true, fechaNacimiento: true, condicionIva: true,
        _count: { select: { pedidos: true } },
      },
    }),
    prisma.comprador.count({ where }),
  ])

  const items = compradores.map((c) => ({
    ...c,
    fechaNacimiento: c.fechaNacimiento.toISOString(),
    totalPedidos: c._count.pedidos,
  }))

  return (
    <Container maxW="container.xl" py={8} px={{ base: 4, md: 6 }}>
      <Flex align="center" justify="space-between" mb={8} wrap="wrap" gap={4}>
        <VStack align="start" gap={0}>
          <Text fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider">
            Panel de administración
          </Text>
          <Text fontSize="2xl" fontWeight="black" color="brand.textMain">Compradores</Text>
        </VStack>
        <Text fontSize="sm" color="brand.textMuted" aria-live="polite">
          {total} {total === 1 ? 'comprador encontrado' : 'compradores encontrados'}
          {search && ' (con búsqueda activa)'}
        </Text>
      </Flex>

      <BuscadorCompradores search={search} />

      <Box bg="brand.bgCard" border="1px solid" borderColor="brand.border" borderRadius="xl" overflow="hidden" as="section" aria-label="Listado de compradores">
        {items.length === 0 ? (
          <EmptyStateCompradores search={search} />
        ) : (
          <Box overflowX="auto">
            <Box as="table" w="full" role="table" aria-label="Listado de compradores">
              <Box as="thead" role="rowgroup">
                <Box as="tr" role="row" borderBottom="1px solid" borderColor="brand.border">
                  {['#', 'Apellido', 'Nombre', 'Mail', 'DNI', 'Pedidos'].map((col) => (
                    <Box as="th" key={col} role="columnheader" px={4} py={3} fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider" fontWeight="semibold" textAlign={col === 'Pedidos' ? 'center' : 'left'}>
                      {col}
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box as="tbody" role="rowgroup">
                {items.map((buyer) => (
                  <BuyerRow key={buyer.id} buyer={buyer} />
                ))}
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {total > LIMIT && (
        <CompradoresPaginacion totalItems={total} limit={LIMIT} offset={offset} />
      )}
    </Container>
  )
}