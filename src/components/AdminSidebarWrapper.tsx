'use client'

import { useState } from 'react'
import { Box } from '@chakra-ui/react'
import AdminSidebar from '@/components/AdminSidebar'

export default function AdminSidebarWrapper({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(p => !p)} />
      <Box flex="1" overflow="auto">
        {children}
      </Box>
    </>
  )
}