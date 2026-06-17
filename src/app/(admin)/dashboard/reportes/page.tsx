'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import {
    Box, Container, Flex, Text, VStack,
    Spinner, Icon,
} from '@chakra-ui/react'
import { FaChartBar, FaExclamationCircle, FaMedal } from 'react-icons/fa'

// ── Tipos ──────────────────────────────────────────────────────────────────

interface TopComprador {
    posicion: number
    comprador: { id: number; nombre: string; apellido: string; mail: string } | null
    totalPedidos: number
    totalMonto: number
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatMonto(monto: number): string {
    return monto.toLocaleString('es-AR', {
        style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
    })
}

const MEDAL_COLORS: Record<number, string> = {
    1: '#F0A500',
    2: '#8B949E',
    3: '#CD7F32',
}

// ── Página ─────────────────────────────────────────────────────────────────

export default function ReportesPage() {
    const { isLoaded, isSignedIn } = useAuth()
    const router = useRouter()

    const [items, setItems] = useState<TopComprador[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!isLoaded) return
        if (!isSignedIn) {
            router.push('/sign-in')
            return
        }

        fetch('/api/admin/reports/top-buyers')
            .then(async (r) => {
                if (r.status === 403) { router.replace('/productos'); return null }
                if (!r.ok) throw new Error()
                return r.json()
            })
            .then((data) => { if (data) setItems(data.items) })
            .catch(() => setError('No pudimos cargar el reporte.'))
            .finally(() => setLoading(false))
    }, [isLoaded, isSignedIn, router])

    // ── Estados de carga ──

    if (!isLoaded || loading) {
        return (
            <Flex justify="center" align="center" minH="60vh">
                <Spinner color="brand.accent" size="lg" />
            </Flex>
        )
    }

    if (error) {
        return (
            <Container maxW="container.md" py={8}>
                <Flex direction="column" align="center" gap={4}>
                    <Icon as={FaExclamationCircle} boxSize={10} color="brand.danger" />
                    <Text color="brand.textMuted">{error}</Text>
                </Flex>
            </Container>
        )
    }

    return (
        <Container maxW="container.md" py={8} px={{ base: 4, md: 6 }}>

            {/* Encabezado */}
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

            {/* Tabla top compradores */}
            <Box
                bg="brand.bgCard"
                border="1px solid"
                borderColor="brand.border"
                borderRadius="xl"
                overflow="hidden"
            >
                <Box px={5} py={4} borderBottom="1px solid" borderColor="brand.border">
                    <Text fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider">
                        Top 10 compradores por monto total
                    </Text>
                </Box>

                {items.length === 0 ? (
                    <Flex direction="column" align="center" py={16} gap={3}>
                        <Icon as={FaChartBar} boxSize={8} color="brand.textMuted" />
                        <Text color="brand.textMuted">No hay datos todavía.</Text>
                    </Flex>
                ) : (
                    <Box as="table" w="full" role="table" aria-label="Top compradores por monto">
                        <Box as="thead" role="rowgroup">
                            <Box as="tr" role="row" borderBottom="1px solid" borderColor="brand.border">
                                {['#', 'Comprador', 'Pedidos', 'Total'].map((col) => (
                                    <Box
                                        as="th"
                                        key={col}
                                        role="columnheader"
                                        px={4} py={3}
                                        fontSize="xs"
                                        color="brand.textMuted"
                                        textTransform="uppercase"
                                        letterSpacing="wider"
                                        fontWeight="semibold"
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
                                    as="tr"
                                    key={item.posicion}
                                    role="row"
                                    _hover={{ bg: 'rgba(255,255,255,0.02)' }}
                                    transition="background 0.15s"
                                    borderBottom="1px solid"
                                    borderColor="brand.border"
                                    _last={{ borderBottom: 'none' }}
                                >
                                    {/* Posición */}
                                    <Box as="td" px={4} py={3} w="48px">
                                        <Flex align="center" justify="center" w="28px" h="28px">
                                            {item.posicion <= 3 ? (
                                                <Icon
                                                    as={FaMedal}
                                                    color={MEDAL_COLORS[item.posicion]}
                                                    boxSize={4}
                                                    aria-label={`Posición ${item.posicion}`}
                                                />
                                            ) : (
                                                <Text fontSize="sm" color="brand.textMuted" fontFamily="mono">
                                                    {item.posicion}
                                                </Text>
                                            )}
                                        </Flex>
                                    </Box>

                                    {/* Comprador */}
                                    <Box as="td" px={4} py={3}>
                                        {item.comprador ? (
                                            <VStack align="start" gap={0}>
                                                <Text fontSize="sm" color="brand.textMain" fontWeight="semibold">
                                                    {item.comprador.nombre} {item.comprador.apellido}
                                                </Text>
                                                <Text fontSize="xs" color="brand.textMuted">
                                                    {item.comprador.mail}
                                                </Text>
                                            </VStack>
                                        ) : (
                                            <Text fontSize="sm" color="brand.textMuted">—</Text>
                                        )}
                                    </Box>

                                    {/* Pedidos */}
                                    <Box as="td" px={4} py={3} textAlign="center">
                                        <Text fontSize="sm" color="brand.textMuted">
                                            {item.totalPedidos}
                                        </Text>
                                    </Box>

                                    {/* Monto */}
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