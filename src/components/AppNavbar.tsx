'use client'

import { useState } from 'react'
import { Box, Flex, Heading, Text, HStack, Input, IconButton, Badge } from '@chakra-ui/react'
import { FaSearch, FaUser, FaShoppingCart, FaTimes, FaBox } from 'react-icons/fa'
import { Show, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import AuthButton from '@/components/ui/AuthButton'
import { useCart } from '@/context/CartContext'
import { useRouter } from 'next/navigation'

export default function AppNavbar() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems } = useCart()
  const router = useRouter()

  const handleSearch = () => {
    const current = new URLSearchParams(window.location.search)
    if (searchQuery.trim()) {
      current.set('search', searchQuery.trim())
    } else {
      current.delete('search')
    }
    current.set('page', '1')
    router.push(`/productos?${current.toString()}`)
  }

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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
            onClick={handleSearch}
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
        <HStack gap={{ base: 1, md: 2 }} flexShrink={0} align="center">

          {/* Lupa / Cruz — solo mobile, alterna barra de búsqueda */}
          {searchOpen ? (
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
              outline="none"
              _focus={{ outline: "none" }}
              _active={{ bg: "transparent" }}
            >
              <FaTimes aria-hidden="true" size={24} />
            </Box>
          ) : (
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
            <AuthButton />
          </Show>

          <Show when="signed-in">
            {/* MODIFICADO: Ajustamos el contenedor para envolver al botón perfectamente sin desvíos */}
            <Flex
              align="center"
              justify="center"
              borderWidth="2px"
              borderStyle="solid"
              borderColor="brand.accent"
              borderRadius="full"
              h="36px"
              w="36px"
              overflow="hidden"
            >
              <UserButton
                appearance={{
                  elements: {
                    // Fuerza al disparador de Clerk a heredar el tamaño redondo exacto de tu contenedor
                    userButtonTrigger: {
                      width: "100%",
                      height: "100%",
                      padding: 0,
                      margin: 0,
                      outline: "none",
                      boxShadow: "none"
                    },
                    // Cambia el fondo violeta inicial de Clerk por un tono oscuro neutro o el acento de tu marca
                    userButtonAvatarFallback: {
                      backgroundColor: "#00d1ff",
                      color: "#0d1117",
                      fontWeight: "bold"
                    },
                    // Remueve cajas azules nativas al hacer focus
                    userButtonAvatarBox: {
                      width: "100%",
                      height: "100%",
                      borderRadius: "full"
                    }
                  }
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="Mis pedidos"
                    labelIcon={<FaBox />}
                    href="/pedidos"
                  />
                  <UserButton.Link
                    label="Mi perfil"
                    labelIcon={<FaUser />}
                    href="/perfil"
                  />
                </UserButton.MenuItems>
              </UserButton>

            </Flex>
          </Show>

          <Link href="/carrito" passHref>
            <Box position="relative">
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
              {totalItems > 0 && (
                <Text
                  position="absolute"
                  top="-2px"
                  right="-2px"
                  bg="brand.accent"
                  color="brand.bgMain" // Asegúrate que sea un color que contraste bien con tu brand.accent
                  fontWeight="black"   // Esto le da el grosor de negrita 
                  fontSize="10px"      // Tamaño pequeño y sutil
                  borderRadius="full"
                  w="18px"
                  h="18px"             // Alto fijo igual al ancho para que sea un círculo perfecto
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  pointerEvents="none" // Para que no bloquee los clics sobre el botón
                >
                  {totalItems}
                </Text>
              )}
            </Box>
          </Link>

        </HStack>
      </Flex>

      {/* BARRA DE BÚSQUEDA MOBILE */}
      {searchOpen && (
        <Box
          as="search"
          role="search"
          display={{ base: 'block', md: 'none' }}
          mt={2}
          position="relative"
        >
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
            onClick={handleSearch}
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