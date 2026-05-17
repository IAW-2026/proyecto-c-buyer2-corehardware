'use client'
import { useState } from 'react'
import { Box, Flex, Heading, Text, HStack, Input, IconButton } from '@chakra-ui/react'
import { FaSearch, FaUser, FaShoppingCart, FaTimes } from 'react-icons/fa'
import { Show, UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function AppNavbar() {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <Box
      as="header"
      role="banner"
      bg="brand.bgCard"
      px={{ base: 4, md: 6 }}
      py={3}
      shadow="2xl"
      position="sticky"
      top="0"
      zIndex="10"
      borderBottom="1px solid"
      borderColor="brand.border"
    >
      {/* FILA PRINCIPAL */}
      <Flex align="center" justify="space-between" w="full" gap={4}>

        {/* LOGO */}
        <Link href="/" passHref style={{ textDecoration: 'none' }} aria-label="CoreHardware - Ir al inicio">
          <Heading
            size="lg"
            color="brand.accent"
            fontWeight="black"
            letterSpacing="widest"
            flexShrink={0}
            _hover={{ opacity: 0.8 }}
          >
            CORE<Text as="span" color="brand.textMain">HARDWARE</Text>
          </Heading>
        </Link>

        {/* BARRA DE BÚSQUEDA — solo desktop, en la misma fila */}
        <Box
          as="search"
          role="search"
          flex="1"
          maxW="700px"
          mx="auto"
          position="relative"
          display={{ base: 'none', md: 'block' }}
        >
          <Input
            placeholder="Buscar componentes..."
            aria-label="Buscar productos en desktop"
            borderRadius="full"
            bg="brand.bgMain"
            border="1px solid"
            borderColor="brand.border"
            color="brand.textMain"
            pl={5}
            pr="48px"
            h="44px"
            _placeholder={{ color: "brand.textMuted" }}
            _focus={{
              borderColor: "brand.accent",
              ring: "1px",
              ringColor: "brand.accent",
              bg: "brand.bgCard",
              outline: 'none'
            }}
          />
          <IconButton
            aria-label="Ejecutar búsqueda"
            variant="ghost"
            color="brand.accent"
            h="36px"
            w="36px"
            position="absolute"
            right="4px"
            top="50%"
            transform="translateY(-50%)"
            borderRadius="full"
            zIndex={2}
            minW="unset"
            _hover={{ bg: "brand.border" }}
            _focus={{ ring: "2px", ringColor: "brand.accent", outline: "none" }}
          >
            <FaSearch aria-hidden="true" size={13} />
          </IconButton>
        </Box>

        {/* ÍCONOS */}
        <HStack gap={{ base: 1, md: 2 }} flexShrink={0}>

          {/* Lupa / Cruz — solo mobile, alterna barra de búsqueda */}
          {searchOpen ? (
            /* MODIFICACIÓN: Cuando está abierto, renderizamos la cruz limpia directamente como elemento interactivo */
            <Box
              as="button"
              role="button"
              aria-label="Cerrar barra de búsqueda"
              aria-expanded="true"
              onClick={() => setSearchOpen(false)}
              display={{ base: 'flex', md: 'none' }}
              alignItems="center"
              justifyContent="center"
              h="44px"
              w="44px"
              color="brand.accent"
              cursor="pointer"
              /* Evitamos cualquier tipo de fondo o borde azul nativo */
              outline="none"
              _focus={{ outline: "none" }}
              _active={{ bg: "transparent" }}
            >
              <FaTimes aria-hidden="true" size={24} />
            </Box>
          ) : (
            /* Cuando está cerrado, se muestra el botón de la lupa estándar */
            <IconButton
              aria-label="Abrir barra de búsqueda"
              aria-expanded="false"
              variant="ghost"
              color="brand.textMain"
              rounded="full"
              h="44px"
              w="44px"
              display={{ base: 'flex', md: 'none' }}
              onClick={() => setSearchOpen(true)}
              _hover={{ bg: "brand.border", color: "brand.accent" }}
              _focus={{ outline: "none", bg: "transparent" }}
              _active={{ bg: "transparent" }}
            >
              <FaSearch aria-hidden="true" />
            </IconButton>
          )}

          <Show when="signed-out">
            <Link href="/sign-in" passHref>
              <IconButton
                aria-label="Iniciar sesión"
                variant="ghost"
                color="brand.textMain"
                rounded="full"
                h="44px"
                w="44px"
                _hover={{ bg: "brand.border", color: "brand.accent" }}
                _focus={{ ring: "2px", ringColor: "brand.accent", outline: "none" }}
              >
                <FaUser aria-hidden="true" />
              </IconButton>
            </Link>
          </Show>

          <Show when="signed-in">
            <Box
              border="2px solid"
              borderColor="brand.accent"
              borderRadius="full"
              p="2px"
              _focusWithin={{ ring: "2px", ringColor: "brand.accent" }}
            >
              <UserButton />
            </Box>
          </Show>

          <Link href="/carrito" passHref>
            <IconButton
              aria-label="Ver carrito de compras"
              variant="ghost"
              color="brand.textMain"
              rounded="full"
              h="44px"
              w="44px"
              _hover={{ bg: "brand.border", color: "brand.accent" }}
              _focus={{ ring: "2px", ringColor: "brand.accent", outline: "none" }}
            >
              <FaShoppingCart aria-hidden="true" />
            </IconButton>
          </Link>

        </HStack>
      </Flex>

      {/* BARRA DE BÚSQUEDA MOBILE — se expande al hacer click en la lupa */}
      {searchOpen && (
        <Box
          as="search"
          role="search"
          display={{ base: 'block', md: 'none' }}
          mt={2}
          position="relative"
        >
          <Input
            placeholder="Buscar componentes..."
            aria-label="Buscar productos en móvil"
            autoFocus
            borderRadius="full"
            bg="brand.bgMain"
            border="1px solid"
            borderColor="brand.accent"
            color="brand.textMain"
            pl={5}
            pr="48px"
            h="48px"
            fontSize="md"
            _placeholder={{ color: "brand.textMuted" }}
            _focus={{
              borderColor: "brand.accent",
              ring: "1px",
              ringColor: "brand.accent",
              outline: 'none'
            }}
          />
          <IconButton
            aria-label="Ejecutar búsqueda móvil"
            variant="ghost"
            color="brand.accent"
            h="40px"
            w="40px"
            position="absolute"
            right="4px"
            top="50%"
            transform="translateY(-50%)"
            borderRadius="full"
            zIndex={2}
            minW="unset"
            _hover={{ bg: "brand.border" }}
            _focus={{ ring: "2px", ringColor: "brand.accent", outline: "none" }}
          >
            <FaSearch aria-hidden="true" size={13} />
          </IconButton>
        </Box>
      )}
    </Box>
  )
}