'use client'

import { useState } from 'react'
import { Box, Text, VStack } from '@chakra-ui/react'
import { formatFecha } from '@/utils/formatDate'

interface Buyer {
  id: string
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

const SEXO_LABEL: Record<string, string> = { M: 'Masculino', F: 'Femenino', X: 'No binario' }

export default function BuyerRow({ buyer }: { buyer: Buyer }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Box as="tr" role="row" _hover={{ bg: 'rgba(255,255,255,0.02)' }} transition="background 0.15s" borderBottom="1px solid" borderColor={open ? 'brand.accent' : 'brand.border'} cursor="pointer" onClick={() => setOpen((p) => !p)}>
        <Box as="td" px={4} py={3} fontFamily="mono" fontSize="sm" color="brand.textMuted">
          #{buyer.id.slice(0, 8)}
        </Box>
        <Box as="td" px={4} py={3}>
          <Text fontSize="sm" color="brand.textMain" fontWeight="semibold">{buyer.apellido}</Text>
        </Box>
        <Box as="td" px={4} py={3}>
          <Text fontSize="sm" color="brand.textMain">{buyer.nombre}</Text>
        </Box>
        <Box as="td" px={4} py={3}>
          <Text fontSize="sm" color="brand.textMuted">{buyer.mail}</Text>
        </Box>
        <Box as="td" px={4} py={3}>
          <Text fontSize="sm" color="brand.textMuted">{buyer.dni}</Text>
        </Box>
        <Box as="td" px={4} py={3} textAlign="center">
          <Text fontSize="sm" color="brand.accent" fontWeight="bold">{buyer.totalPedidos}</Text>
        </Box>
      </Box>

      {open && (
        <Box as="tr" role="row">
          <td colSpan={6} style={{ padding: 0, borderBottom: '1px solid var(--chakra-colors-brand-border)' }}>
            <Box px={4} py={3} bg="rgba(0,209,255,0.03)">
              <Box display="grid" gridTemplateColumns={{ base: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={4}>
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