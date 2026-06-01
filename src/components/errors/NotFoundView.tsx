'use client'

import Link from 'next/link'
import { Flex, Heading, Text, VStack, Icon } from '@chakra-ui/react'
import { FaExclamationTriangle } from 'react-icons/fa'
import { useAuth } from '@clerk/nextjs'
import AppNavbar from '@/components/AppNavbar'
import { brandColors } from '@/styles/colors'

export default function NotFoundView() {
  const { sessionClaims, isLoaded } = useAuth()
  const role = (sessionClaims?.metadata as any)?.role
  const isAdmin = role === 'admin'

  return (
    <>
      <AppNavbar />
      <Flex minH="80vh" align="center" justify="center" bg={brandColors.bgMain} px={4}>
        <VStack gap={6} textAlign="center">
          <Icon as={FaExclamationTriangle} boxSize={16} color={brandColors.accent} aria-hidden="true" />
          <VStack gap={2}>
            <Heading as="h1" fontSize="6xl" fontWeight="black" color={brandColors.textMain} fontFamily="mono">
              404
            </Heading>
            <Heading as="h2" fontSize="xl" fontWeight="semibold" color={brandColors.textMain}>
              Página no encontrada
            </Heading>
            <Text color={brandColors.textMuted} maxW="360px">
              La página que buscás no existe o fue movida.
            </Text>
          </VStack>
          {isLoaded && (
            <Link
              href={isAdmin ? '/dashboard' : '/productos'}
              style={{
                padding: '12px 24px',
                background: brandColors.accent,
                color: brandColors.bgMain,
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '14px',
                textDecoration: 'none',
              }}
              aria-label={isAdmin ? 'Ir al dashboard' : 'Ir al catálogo de productos'}
            >
              {isAdmin ? 'Ir al dashboard' : 'Ver productos'}
            </Link>
          )}
        </VStack>
      </Flex>
    </>
  )
}