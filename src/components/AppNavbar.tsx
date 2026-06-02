'use client'

import { Box, Flex, HStack } from '@chakra-ui/react'
import { Show } from '@clerk/nextjs'
import AuthButton from '@/components/ui/AuthButton'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { useCart } from '@/context/CartContext'
import NavbarLogo from '@/components/navbar/NavbarLogo'
import { NavbarSearch } from '@/components/navbar/NavbarSearch'
import { CartIcon } from '@/components/navbar/CartIcon'

export default function AppNavbar() {
  const { totalItems } = useCart()

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
      <Flex align="center" justify="space-between" w="full" gap={4}>
        <NavbarLogo />

        <NavbarSearch />

        <HStack gap={{ base: 1, md: 2 }} flexShrink={0} align="center">
          <Show when="signed-out">
            <AuthButton />
          </Show>
          <Show when="signed-in">
            <UserAvatar showUserLinks />
          </Show>
          <CartIcon totalItems={totalItems} />
        </HStack>
      </Flex>
    </Box>
  )
}