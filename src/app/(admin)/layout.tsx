import { Flex } from '@chakra-ui/react'
import AdminNavbar from '@/components/AdminNavbar'
import AdminSidebarWrapper from '@/components/AdminSidebarWrapper'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex direction="column" minH="100vh">
      <AdminNavbar />
      <Flex flex="1">
        <AdminSidebarWrapper>{children}</AdminSidebarWrapper>
      </Flex>
    </Flex>
  )
}