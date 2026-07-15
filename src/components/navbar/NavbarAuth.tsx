'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { HStack } from '@chakra-ui/react'
import AuthButton from '@/components/ui/AuthButton'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { CartIconClient } from '@/components/navbar/CartIconClient'

export function NavbarAuth() {
  const { isSignedIn, isLoaded } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  return (
    <HStack gap={{ base: 1, md: 2 }} flexShrink={0} align="center">
      {mounted && isLoaded && (
        isSignedIn ? <UserAvatar showUserLinks /> : <AuthButton />
      )}
      <CartIconClient />
    </HStack>
  )
}