import AppNavbar from '@/components/AppNavbar'
import { Box, Flex } from '@chakra-ui/react'

export default function TiendaLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex direction="column" minH="100vh">
      <AppNavbar />
      <Box flex={1} display="flex" flexDirection="column">
        {children}
      </Box>
    </Flex>
  )
}