'use client'

import { SignInButton } from '@clerk/nextjs'
import { IconButton } from '@chakra-ui/react'
import { FaUser } from 'react-icons/fa'

export default function AuthButton() {
    return (
        <SignInButton mode="redirect">
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
                <span aria-hidden="true">
                    <FaUser />
                </span>
            </IconButton>
        </SignInButton>
    )
}