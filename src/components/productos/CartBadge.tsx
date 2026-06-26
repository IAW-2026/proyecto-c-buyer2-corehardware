'use client'

import { memo, useEffect, useState } from 'react'
import { useCart } from '@/context/CartContext'
import { Box, Text } from '@chakra-ui/react'

interface CartBadgeProps {
  productoId: string
}

export const CartBadge = memo(function CartBadge({ productoId }: CartBadgeProps) {
  const { items } = useCart()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  const item = items.find(i => i.id === productoId)
  if (!item || item.cantidad === 0) return null

  return (
    <Box
      position="absolute"
      top={2}
      right={2}
      zIndex={2}
      bg="brand.accent"
      color="brand.bgMain"
      borderRadius="full"
      minW="22px"
      h="22px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={1}
      aria-label={`${item.cantidad} en el carrito`}
    >
      <Text fontSize="xs" fontWeight="black" lineHeight={1}>
        {item.cantidad}
      </Text>
    </Box>
  )
})