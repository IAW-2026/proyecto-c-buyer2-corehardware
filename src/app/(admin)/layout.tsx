'use client'

import { useState } from 'react'
import { Flex, Box } from '@chakra-ui/react'
import AdminNavbar from '@/components/AdminNavbar'
import AdminSidebar from '@/components/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Flex direction="column" minH="100vh">
      <AdminNavbar />
      <Flex flex="1">
        <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(p => !p)} />
        <Box flex="1" overflow="auto">
          {children}
        </Box>
      </Flex>
    </Flex>
  )
}