import AppNavbar from '@/components/AppNavbar'
import { Box, Flex } from '@chakra-ui/react'
import { CartProvider } from '@/context/CartContext'
import { Toaster } from '@/components/ui/toaster'  

export default function TiendaLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Flex direction="column" minH="100vh">
        <AppNavbar />
        <Box flex={1} display="flex" flexDirection="column">
          {children}
        </Box>
        <Toaster />  
      </Flex>
    </CartProvider>
  )
}