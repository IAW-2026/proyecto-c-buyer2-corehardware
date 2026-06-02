'use client'

import { useRouter } from "next/navigation"
import { Box, Flex,Text, VStack, Icon } from "@chakra-ui/react"
import { FaExclamationCircle, FaShoppingBag } from "react-icons/fa"
import { use } from "react"

// ── EmptyState ─────────────────────────────────────────────────────────────

export function EmptyState() {
  const router = useRouter()
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      py={20}
      gap={4}
      role="status"
      aria-label="No tenés pedidos aún"
    >
      <Box
        p={6}
        borderRadius="full"
        bg="rgba(0,209,255,0.08)"
        border="1px solid"
        borderColor="brand.border"
        aria-hidden="true"
      >
        <Icon as={FaShoppingBag} boxSize={10} color="brand.textMuted" />
      </Box>
      <VStack gap={1}>
        <Text fontSize="xl" fontWeight="bold" color="brand.textMain">
          Todavía no tenés pedidos
        </Text>
        <Text color="brand.textMuted" textAlign="center" maxW="300px">
          Explorá el catálogo y hacé tu primera compra en CoreHardware
        </Text>
      </VStack>
      <Box
        as="button"
        px={6} py={3}
        bg="brand.accent"
        color="brand.bgMain"
        borderRadius="lg"
        fontWeight="bold"
        fontSize="sm"
        transition="all 0.2s"
        _hover={{ opacity: 0.85, transform: 'translateY(-1px)' }}
        _focus={{ outline: '2px solid', outlineColor: 'brand.accent', outlineOffset: '2px' }}
        onClick={() => router.push('/productos')}
        aria-label="Ir al catálogo de productos"
      >
        Ver catálogo
      </Box>
    </Flex>
  )
}

// ── ErrorState ─────────────────────────────────────────────────────────────

export function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="40vh"
      gap={4}
      role="alert"
      aria-live="assertive"
    >
      <Icon as={FaExclamationCircle} boxSize={10} color="brand.danger" aria-hidden="true" />
      <Text color="brand.textMuted">{error}</Text>
      <Box
        as="button"
        px={5} py={2}
        border="1px solid" borderColor="brand.border"
        borderRadius="lg" color="brand.textMain" fontSize="sm"
        _hover={{ borderColor: 'brand.accent', color: 'brand.accent' }}
        _focus={{ outline: '2px solid', outlineColor: 'brand.accent', outlineOffset: '2px' }}
        onClick={onRetry}
        aria-label="Reintentar cargar los pedidos"
      >
        Reintentar
      </Box>
    </Flex>
  )
}
