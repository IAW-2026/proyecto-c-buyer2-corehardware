'use client'

import { Box, Flex, Heading, Text } from '@chakra-ui/react'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function AdminNavbar() {
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
      <Flex align="center" justify="space-between" w="full">

        {/* LOGO */}
        <Link href="/dashboard" style={{ textDecoration: 'none' }} aria-label="CoreHardware Admin - Ir al dashboard">
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
                userButtonTrigger: { width: '100%', height: '100%', padding: 0, margin: 0, outline: 'none', boxShadow: 'none' },
                userButtonAvatarFallback: { backgroundColor: '#00d1ff', color: '#0d1117', fontWeight: 'bold' },
                userButtonAvatarBox: { width: '100%', height: '100%', borderRadius: 'full' },
              },
            }}
          />
        </Flex>
      </Flex>
    </Box>
  )
}