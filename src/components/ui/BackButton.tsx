'use client'

import { Button, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { FaArrowLeft } from 'react-icons/fa'

interface BackButtonProps {
  href: string
}

export function BackButton({ href }: BackButtonProps) {
  const router = useRouter()
  return (
    <Button
      variant="ghost" color="brand.accent"
      onClick={() => router.push(href)}
      aria-label="Volver atrás" _hover={{ bg: "brand.bgCard" }}
    >
      <FaArrowLeft /> <Text ml={2}>Volver</Text>
    </Button>
  )
}