'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import {
    Box, Container, Flex, Text, VStack,
    Spinner, Icon, Input,
} from '@chakra-ui/react'
import { FaUsers, FaExclamationCircle, FaSearch } from 'react-icons/fa'
import PaginationAdmin from '@/components/PaginationAdmin'
import { formatFecha } from '@/utils/formatDate'

// ── Tipos ──────────────────────────────────────────────────────────────────

interface Buyer {
    id: number
    nombre: string
    apellido: string
    mail: string
    dni: string
    cuilCuit: string
    celular: string
    direccion: string
    nacionalidad: string
    sexo: string | null
    fechaNacimiento: string
    condicionIva: string
    totalPedidos: number
}

interface BuyersResponse {
    items: Buyer[]
    total: number
    limit: number
    offset: number
}

// ── Constantes ─────────────────────────────────────────────────────────────

const LIMIT = 10

// ── Helpers ────────────────────────────────────────────────────────────────

const SEXO_LABEL: Record<string, string> = { M: 'Masculino', F: 'Femenino', X: 'No binario' }

// ── Componente fila expandible ─────────────────────────────────────────────

function BuyerRow({ buyer }: { buyer: Buyer }) {
    const [open, setOpen] = useState(false)

    return (
        <>
            <Box
                as="tr"
                role="row"
                _hover={{ bg: 'rgba(255,255,255,0.02)' }}
                transition="background 0.15s"
                borderBottom="1px solid"
                borderColor={open ? 'brand.accent' : 'brand.border'}
                cursor="pointer"
                onClick={() => setOpen(p => !p)}
            >
                <Box as="td" px={4} py={3} fontFamily="mono" fontSize="sm" color="brand.textMuted">
                    #{buyer.id}
                </Box>
                <Box as="td" px={4} py={3}>
                    <Text fontSize="sm" color="brand.textMain" fontWeight="semibold">
                        {buyer.apellido}
                    </Text>
                </Box>
                <Box as="td" px={4} py={3}>
                    <Text fontSize="sm" color="brand.textMain">
                        {buyer.nombre}
                    </Text>
                </Box>
                <Box as="td" px={4} py={3}>
                    <Text fontSize="sm" color="brand.textMuted">{buyer.mail}</Text>
                </Box>
                <Box as="td" px={4} py={3}>
                    <Text fontSize="sm" color="brand.textMuted">{buyer.dni}</Text>
                </Box>
                <Box as="td" px={4} py={3} textAlign="center">
                    <Text fontSize="sm" color="brand.accent" fontWeight="bold">
                        {buyer.totalPedidos}
                    </Text>
                </Box>
            </Box>

            {open && (
                <Box as="tr" role="row">
                    <td
                        colSpan={6}
                        style={{ padding: 0, borderBottom: '1px solid var(--chakra-colors-brand-border)' }}
                    >
                        <Box px={4} py={3} bg="rgba(0,209,255,0.03)">
                            <Box
                                display="grid"
                                gridTemplateColumns={{ base: '1fr 1fr', md: 'repeat(4, 1fr)' }}
                                gap={4}
                            >
                                <VStack align="start" gap={0}>
                                    <Text fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider">CUIL/CUIT</Text>
                                    <Text fontSize="sm" color="brand.textMain">{buyer.cuilCuit}</Text>
                                </VStack>
                                <VStack align="start" gap={0}>
                                    <Text fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider">Celular</Text>
                                    <Text fontSize="sm" color="brand.textMain">{buyer.celular}</Text>
                                </VStack>
                                <VStack align="start" gap={0}>
                                    <Text fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider">Fecha de nac.</Text>
                                    <Text fontSize="sm" color="brand.textMain">{formatFecha(buyer.fechaNacimiento)}</Text>
                                </VStack>
                                <VStack align="start" gap={0}>
                                    <Text fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider">Sexo</Text>
                                    <Text fontSize="sm" color="brand.textMain">{buyer.sexo ? SEXO_LABEL[buyer.sexo] ?? buyer.sexo : '—'}</Text>
                                </VStack>
                                <VStack align="start" gap={0}>
                                    <Text fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider">Nacionalidad</Text>
                                    <Text fontSize="sm" color="brand.textMain">{buyer.nacionalidad}</Text>
                                </VStack>
                                <VStack align="start" gap={0}>
                                    <Text fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider">Dirección</Text>
                                    <Text fontSize="sm" color="brand.textMain">{buyer.direccion}</Text>
                                </VStack>
                                <VStack align="start" gap={0}>
                                    <Text fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider">Cond. IVA</Text>
                                    <Text fontSize="sm" color="brand.textMain">{buyer.condicionIva}</Text>
                                </VStack>
                            </Box>
                        </Box>
                    </td>
                </Box>
            )}
        </>
    )
}

// ── Página ─────────────────────────────────────────────────────────────────

export default function CompradoresPage() {
    const { isLoaded, isSignedIn } = useAuth()
    const router = useRouter()

    const [items, setItems] = useState<Buyer[]>([])
    const [total, setTotal] = useState(0)
    const [offset, setOffset] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [applied, setApplied] = useState('')

    const fetchBuyers = useCallback(async (currentSearch: string, currentOffset: number) => {
        setLoading(true)
        setError(null)
        try {
            const params = new URLSearchParams()
            params.set('limit', LIMIT.toString())
            params.set('offset', currentOffset.toString())
            if (currentSearch) params.set('search', currentSearch)

            const res = await fetch(`/api/admin/buyers?${params}`)
            if (res.status === 403) { router.replace('/productos'); return }
            if (!res.ok) throw new Error()
            const data: BuyersResponse = await res.json()
            setItems(data.items)
            setTotal(data.total)
        } catch {
            setError('No pudimos cargar los compradores.')
        } finally {
            setLoading(false)
        }
    }, [router])

    useEffect(() => {
        if (!isLoaded) return
        if (!isSignedIn) { router.push('/sign-in'); return }
        fetchBuyers(applied, offset)
    }, [isLoaded, isSignedIn, applied, offset, fetchBuyers, router])

    const handleSearch = () => {
        setOffset(0)
        setApplied(search)
    }

    const handleClear = () => {
        setSearch('')
        setApplied('')
        setOffset(0)
    }

    const handlePageChange = (newOffset: number) => {
        setOffset(newOffset)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    if (!isLoaded || loading) {
        return (
            <Flex justify="center" align="center" minH="60vh">
                <Spinner color="brand.accent" size="lg" />
            </Flex>
        )
    }

    if (error) {
        return (
            <Container maxW="container.xl" py={8}>
                <Flex direction="column" align="center" gap={4}>
                    <Icon as={FaExclamationCircle} boxSize={10} color="brand.danger" />
                    <Text color="brand.textMuted">{error}</Text>
                    <Box
                        as="button"
                        px={5} py={2}
                        border="1px solid" borderColor="brand.border"
                        borderRadius="lg" color="brand.textMain" fontSize="sm"
                        _hover={{ borderColor: 'brand.accent', color: 'brand.accent' }}
                        onClick={() => fetchBuyers(applied, offset)}
                    >
                        Reintentar
                    </Box>
                </Flex>
            </Container>
        )
    }

    return (
        <Container maxW="container.xl" py={8} px={{ base: 4, md: 6 }}>

            {/* Encabezado */}
            <Flex align="center" gap={3} mb={8}>
                <VStack align="start" gap={0}>
                    <Text fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider">
                        Panel de administración
                    </Text>
                    <Text fontSize="2xl" fontWeight="black" color="brand.textMain">
                        Compradores
                    </Text>
                </VStack>
                <Flex
                    ml="auto"
                    w="44px" h="44px"
                    borderRadius="full"
                    bg="rgba(0,209,255,0.08)"
                    border="1px solid"
                    borderColor="brand.border"
                    align="center"
                    justify="center"
                >
                    <Icon as={FaUsers} color="brand.accent" boxSize={4} />
                </Flex>
            </Flex>

            {/* Buscador */}
            <Box
                bg="brand.bgCard"
                border="1px solid"
                borderColor="brand.border"
                borderRadius="xl"
                p={5}
                mb={6}
            >
                <Text fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider" mb={3}>
                    Buscar
                </Text>
                <Flex gap={3}>
                    <Input
                        placeholder="Nombre, apellido, mail o DNI..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        bg="brand.bgMain"
                        border="1px solid"
                        borderColor="brand.border"
                        color="brand.textMain"
                        size="sm"
                        borderRadius="lg"
                        _focus={{ borderColor: 'brand.accent', outline: 'none' }}
                    />
                    {applied && (
                        <Box
                            as="button"
                            px={4} py={2}
                            border="1px solid"
                            borderColor="brand.border"
                            borderRadius="lg"
                            color="brand.textMuted"
                            fontSize="sm"
                            flexShrink={0}
                            _hover={{ borderColor: 'brand.accent', color: 'brand.accent' }}
                            onClick={handleClear}
                        >
                            Limpiar
                        </Box>
                    )}
                    <Box
                        as="button"
                        px={5} py={2}
                        bg="brand.accent"
                        color="brand.bgMain"
                        borderRadius="lg"
                        fontSize="sm"
                        fontWeight="bold"
                        flexShrink={0}
                        _hover={{ opacity: 0.85 }}
                        onClick={handleSearch}
                        aria-label="Buscar compradores"
                    >
                        <Icon as={FaSearch} boxSize={3} />
                    </Box>
                </Flex>
            </Box>

            {/* Contador */}
            <Flex justify="flex-end" mb={3}>
                <Text fontSize="sm" color="brand.textMuted" aria-live="polite">
                    {total} {total === 1 ? 'comprador encontrado' : 'compradores encontrados'}
                    {applied && ' (con búsqueda activa)'}
                </Text>
            </Flex>

            {/* Tabla */}
            <Box
                bg="brand.bgCard"
                border="1px solid"
                borderColor="brand.border"
                borderRadius="xl"
                overflow="hidden"
                as="section"
                aria-label="Listado de compradores"
            >
                {items.length === 0 ? (
                    <Flex direction="column" align="center" py={16} gap={3}>
                        <Icon as={FaUsers} boxSize={8} color="brand.textMuted" />
                        <Text color="brand.textMuted">
                            {applied ? 'No hay compradores con esa búsqueda.' : 'No hay compradores todavía.'}
                        </Text>
                    </Flex>
                ) : (
                    <Box overflowX="auto">
                        <Box as="table" w="full" role="table" aria-label="Listado de compradores">
                            <Box as="thead" role="rowgroup">
                                <Box as="tr" role="row" borderBottom="1px solid" borderColor="brand.border">
                                    {['#', 'Apellido', 'Nombre', 'Mail', 'DNI', 'Pedidos'].map((col) => (
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
                                            textAlign={col === 'Pedidos' ? 'center' : 'left'}
                                        >
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

            {/* Paginación */}
            {total > LIMIT && (
                <PaginationAdmin
                    totalItems={total}
                    limit={LIMIT}
                    offset={offset}
                    onPageChange={handlePageChange}
                />
            )}

        </Container>
    )
}