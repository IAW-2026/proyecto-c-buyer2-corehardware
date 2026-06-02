'use client'

import Link from 'next/link'
import { Flex, Heading, Text, VStack, Icon } from '@chakra-ui/react'
import { FaBug } from 'react-icons/fa'
import AppNavbar from '@/components/AppNavbar'
import { brandColors } from '@/styles/colors'

interface ErrorViewProps {
  reset: () => void
}

export default function ErrorView({ reset }: ErrorViewProps) {
  return (
    <>
      <AppNavbar />
      <Flex minH="80vh" align="center" justify="center" bg={brandColors.bgMain} px={4}>
        <VStack gap={6} textAlign="center">
          <Icon as={FaBug} boxSize={16} color={brandColors.danger} aria-hidden="true" />
          <VStack gap={2}>
            <Heading as="h1" fontSize="xl" fontWeight="semibold" color={brandColors.textMain}>
              Algo salió mal
            </Heading>
            <Text color={brandColors.textMuted} maxW="360px">
              Ocurrió un error inesperado. Podés intentar de nuevo o volver al inicio.
            </Text>
          </VStack>
          <Flex gap={3}>
            <button
              onClick={reset}
              style={{
                padding: '12px 24px',
                background: brandColors.accent,
                color: brandColors.bgMain,
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                border: 'none',
              }}
              aria-label="Intentar de nuevo"
            >
              Intentar de nuevo
            </button>
            <Link
              href="/productos"
              style={{
                padding: '12px 24px',
                border: `1px solid ${brandColors.border}`,
                color: brandColors.textMain,
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '14px',
                textDecoration: 'none',
              }}
              aria-label="Ir al catálogo"
            >
              Ir al catálogo
            </Link>
          </Flex>
        </VStack>
      </Flex>
    </>
  )
}