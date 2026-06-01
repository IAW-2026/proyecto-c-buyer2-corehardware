'use client'

import { Box, Flex, Text, VStack, Icon } from '@chakra-ui/react'
import { FaFilter, FaTimes } from 'react-icons/fa'
import { brandColors } from '@/styles/colors'

interface FiltrosProps {
    marcas: string[]
    vendedores: string[]
    marcaSeleccionada: string
    vendedorSeleccionado: string
    onMarcaChange: (marca: string) => void
    onVendedorChange: (vendedor: string) => void
    onLimpiar: () => void
    hayFiltrosActivos: boolean
}

// ── Componente de select accesible ─────────────────────────────────────────

interface FiltroSelectProps {
    id: string
    label: string
    value: string
    options: string[]
    placeholder: string
    onChange: (value: string) => void
}

function FiltroSelect({ id, label, value, options, placeholder, onChange }: FiltroSelectProps) {
    return (
        <VStack align="start" gap={1.5} w="full">
            <label
                htmlFor={id}
                style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: brandColors.textMuted,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase' as const,
                }}
            >
                {label}
            </label>
            <select
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-label={label}
                style={{
                    width: '100%',
                    background: brandColors.bgMain,
                    border: `1px solid ${value ? brandColors.accent : brandColors.border}`,
                    borderRadius: '8px',
                    color: value ? brandColors.textMain : brandColors.textMuted,
                    fontSize: '13px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    outline: 'none',
                    appearance: 'none',
                }}
                onFocus={(e) => { e.target.style.borderColor = brandColors.accent }}
                onBlur={(e) => { e.target.style.borderColor = value ? brandColors.accent : brandColors.border }}
            >
                <option value="">{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        </VStack>
    )
}

// ── Panel de filtros ───────────────────────────────────────────────────────

export default function FiltrosProductos({
    marcas,
    vendedores,
    marcaSeleccionada,
    vendedorSeleccionado,
    onMarcaChange,
    onVendedorChange,
    onLimpiar,
    hayFiltrosActivos,
}: FiltrosProps) {
    return (
        <Box
            as="aside"
            aria-label="Panel de filtros"
            bg="brand.bgCard"
            border="1px solid"
            borderColor="brand.border"
            borderRadius="xl"
            p={5}
            w={{ base: 'full', lg: '220px' }}
            minW={{ lg: '220px' }}
            flexShrink={0}
            h="fit-content"
            position={{ lg: 'sticky' }}
            top={{ lg: '80px' }}
        >
            {/* Header del panel */}
            <Flex justify="space-between" align="center" mb={4}>
                <Flex align="center" gap={2}>
                    <Icon as={FaFilter} boxSize={3} color="brand.accent" aria-hidden="true" />
                    <Text fontSize="13px" fontWeight={600} color="brand.textMain">
                        Filtros
                    </Text>
                </Flex>

                {hayFiltrosActivos && (
                    <Box
                        as="button"
                        onClick={onLimpiar}
                        display="flex"
                        alignItems="center"
                        gap={1}
                        fontSize="11px"
                        color="brand.textMuted"
                        _hover={{ color: 'brand.danger' }}
                        _focus={{ outline: '2px solid', outlineColor: 'brand.accent', outlineOffset: '2px', borderRadius: '4px' }}
                        aria-label="Limpiar todos los filtros"
                        cursor="pointer"
                        bg="transparent"
                        border="none"
                        p={1}
                    >
                        <Icon as={FaTimes} boxSize={2.5} aria-hidden="true" />
                        <Text>Limpiar</Text>
                    </Box>
                )}
            </Flex>

            {/* Separador */}
            <Box borderTop="1px solid" borderColor="brand.border" mb={4} />

            {/* Filtros */}
            <VStack gap={4} align="stretch">
                <FiltroSelect
                    id="filtro-marca"
                    label="Marca"
                    value={marcaSeleccionada}
                    options={marcas}
                    placeholder="Todas las marcas"
                    onChange={onMarcaChange}
                />
                <FiltroSelect
                    id="filtro-vendedor"
                    label="Vendedor"
                    value={vendedorSeleccionado}
                    options={vendedores}
                    placeholder="Todos los vendedores"
                    onChange={onVendedorChange}
                />
            </VStack>

            {/* Indicador de filtros activos */}
            {hayFiltrosActivos && (
                <Box
                    mt={4}
                    pt={4}
                    borderTop="1px solid"
                    borderColor="brand.border"
                >
                    <Text fontSize="11px" color="brand.accent" fontWeight={500}>
                        {[marcaSeleccionada, vendedorSeleccionado].filter(Boolean).length} filtro(s) activo(s)
                    </Text>
                </Box>
            )}
        </Box>
    )
}