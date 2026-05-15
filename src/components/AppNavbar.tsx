'use client'
import { Box, Flex, Heading, Text, HStack, Input, IconButton } from '@chakra-ui/react'
import { FaSearch, FaUser, FaShoppingCart } from 'react-icons/fa'
import { Show, UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function AppNavbar() {
  const colors = {
    bgMain: "#0D1117",
    bgCard: "#161B22",
    accent: "#00D1FF",
    border: "#21262D",
    textMain: "#E6EDF3",
    textMuted: "#8B949E"
  }

  return (
    <Box 
      bg={colors.bgCard} 
      px={8} 
      py={4} 
      shadow="2xl" 
      position="sticky" 
      top="0" 
      zIndex="10" 
      borderBottom="1px solid" 
      borderColor={colors.border}
    >
      <Flex align="center" justify="space-between" w="full" maxW="1400px" mx="auto">
        
        <Link href="/" passHref style={{ textDecoration: 'none' }}>
          <Heading
            size="lg"
            color={colors.accent}
            fontWeight="black"
            letterSpacing="widest"
            _hover={{ opacity: 0.8 }}
          >
            CORE<Text as="span" color={colors.textMain}>HW</Text>
          </Heading>
        </Link>

        <HStack flex="1" maxW="600px" mx={10}>
          <Input
            placeholder="Buscar componentes..."
            borderRadius="full"
            bg={colors.bgMain}
            border="1px solid"
            borderColor={colors.border}
            color={colors.textMain}
            px={6}
            _placeholder={{ color: colors.textMuted }}
            _focus={{
              borderColor: colors.accent,
              ring: "1px",
              ringColor: colors.accent,
              bg: colors.bgCard
            }}
          />
          <IconButton 
            aria-label="Search" 
            variant="ghost" 
            color={colors.accent} 
            _hover={{ bg: colors.border }}
          >
            <FaSearch />
          </IconButton>
        </HStack>

        <HStack gap="6">
          
          <Show when="signed-out">
            <Link href="/sign-in" passHref>
              <IconButton 
                aria-label="Login" 
                variant="ghost" 
                color={colors.textMain} 
                rounded="full" 
                _hover={{ bg: colors.border, color: colors.accent }}
              >
                <FaUser />
              </IconButton>
            </Link>
          </Show>

          <Show when="signed-in">
            <Box border="2px solid" borderColor={colors.accent} borderRadius="full" p="2px">
              <UserButton />
            </Box>
          </Show>

          <Link href="/carrito" passHref>
            <IconButton 
              aria-label="Carrito" 
              variant="ghost" 
              color={colors.textMain} 
              rounded="full" 
              _hover={{ bg: colors.border, color: colors.accent }}
            >
              <FaShoppingCart />
            </IconButton>
          </Link>
          
        </HStack>
      </Flex>
    </Box>
  )
}