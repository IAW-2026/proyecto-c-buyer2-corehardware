import { Box, Flex } from '@chakra-ui/react'
import NavbarLogo from '@/components/navbar/NavbarLogo'
import { NavbarSearch } from '@/components/navbar/NavbarSearch'
import { NavbarAuth } from '@/components/navbar/NavbarAuth' 

export default function AppNavbar() {
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
        <NavbarAuth />
      </Flex>
    </Box>
  )
}