import Link from 'next/link'
import { Button, Text } from '@chakra-ui/react'
import { FaArrowLeft } from 'react-icons/fa'

interface BackButtonProps {
  href: string
}

export function BackButton({ href }: BackButtonProps) {
  return (
    <Link href={href} aria-label="Volver atrás">
      <Button
        variant="ghost"
        color="brand.accent"
        _hover={{ bg: 'brand.bgCard' }}
        tabIndex={-1}
      >
        <FaArrowLeft /> <Text ml={2}>Volver</Text>
      </Button>
    </Link>
  )
}