'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { system } from '@/styles/theme' // Asegurate de que la ruta apunte correctamente a donde guardaste tu theme.ts

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={system}>
      {children}
    </ChakraProvider>
  )
}