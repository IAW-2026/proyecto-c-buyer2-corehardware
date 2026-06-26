import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Box, Container, Flex, Text, VStack } from '@chakra-ui/react'
import { getTopCompradores } from '@/lib/queries/admin'
import { formatMonto } from '@/utils/pedidoUtils'
import MedalIcon, { EmptyState } from '@/components/admin/MedalIcon'

export default async function ReportesPage() {
  const { userId, sessionClaims } = await auth()
  if (!userId) redirect('/sign-in')
  const role = (sessionClaims?.metadata as Record<string, unknown>)?.role
  if (role !== 'admin') redirect('/productos')

  const items = await getTopCompradores()

  return (
    <Container maxW="container.md" py={8} px={{ base: 4, md: 6 }}>

      <Flex align="center" gap={3} mb={8}>
        <VStack align="start" gap={0}>
          <Text fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider">
            Panel de administración
          </Text>
          <Text fontSize="2xl" fontWeight="black" color="brand.textMain">
            Reportes
          </Text>
        </VStack>
      </Flex>

      <Box bg="brand.bgCard" border="1px solid" borderColor="brand.border" borderRadius="xl" overflow="hidden">
        <Box px={5} py={4} borderBottom="1px solid" borderColor="brand.border">
          <Text fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider">
            Top 10 compradores por monto total
          </Text>
        </Box>

        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <Box as="table" w="full" role="table" aria-label="Top compradores por monto">
            <Box as="thead" role="rowgroup">
              <Box as="tr" role="row" borderBottom="1px solid" borderColor="brand.border">
                {['#', 'Comprador', 'Pedidos', 'Total'].map((col) => (
                  <Box
                    as="th" key={col} role="columnheader" px={4} py={3}
                    fontSize="xs" color="brand.textMuted" textTransform="uppercase"
                    letterSpacing="wider" fontWeight="semibold"
                    textAlign={col === 'Total' ? 'right' : col === 'Pedidos' ? 'center' : 'left'}
                  >
                    {col}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box as="tbody" role="rowgroup">
              {items.map((item) => (
                <Box
                  as="tr" key={item.posicion} role="row"
                  _hover={{ bg: 'rgba(255,255,255,0.02)' }} transition="background 0.15s"
                  borderBottom="1px solid" borderColor="brand.border" _last={{ borderBottom: 'none' }}
                >
                  <Box as="td" px={4} py={3} w="48px">
                    <MedalIcon posicion={item.posicion} />
                  </Box>

                  <Box as="td" px={4} py={3}>
                    {item.comprador ? (
                      <VStack align="start" gap={0}>
                        <Text fontSize="sm" color="brand.textMain" fontWeight="semibold">
                          {item.comprador.nombre} {item.comprador.apellido}
                        </Text>
                        <Text fontSize="xs" color="brand.textMuted">{item.comprador.mail}</Text>
                      </VStack>
                    ) : (
                      <Text fontSize="sm" color="brand.textMuted">—</Text>
                    )}
                  </Box>

                  <Box as="td" px={4} py={3} textAlign="center">
                    <Text fontSize="sm" color="brand.textMuted">{item.totalPedidos}</Text>
                  </Box>

                  <Box as="td" px={4} py={3} textAlign="right">
                    <Text fontSize="sm" fontWeight="bold" color="brand.accent">
                      {formatMonto(item.totalMonto)}
                    </Text>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  )
}