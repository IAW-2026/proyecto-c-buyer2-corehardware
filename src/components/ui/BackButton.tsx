'use client'

import { Button, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { FaArrowLeft } from 'react-icons/fa'

export function BackButton() {
    const router = useRouter()
    return (
        <Button
            variant="ghost" color="brand.accent" onClick={() => router.back()}
            aria-label="Volver atrás" _hover={{ bg: "brand.bgCard" }}
        >
            <FaArrowLeft /> <Text ml={2}>Volver</Text>
        </Button>
    )
}