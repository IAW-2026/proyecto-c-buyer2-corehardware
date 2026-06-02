import Link from 'next/link'
import { Box, IconButton, Text } from '@chakra-ui/react'
import { FaShoppingCart } from 'react-icons/fa'

interface CartIconProps {
  totalItems: number
}

export function CartIcon({ totalItems }: CartIconProps) {
  return (
    <Link
      href="/carrito"
      aria-label={`Ver carrito — ${totalItems} ${totalItems === 1 ? 'producto' : 'productos'}`}
    >
      <Box position="relative">
        <IconButton
          aria-hidden="true"
          tabIndex={-1}
          variant="ghost"
          color="brand.textMain"
          rounded="full"
          h="44px"
          w="44px"
          _hover={{ bg: 'brand.border', color: 'brand.accent' }}
          _focus={{ ring: '2px', ringColor: 'brand.accent', outline: 'none' }}
        >
          <FaShoppingCart aria-hidden="true" />
        </IconButton>
        {totalItems > 0 && (
          <Text
            position="absolute"
            top="-2px"
            right="-2px"
            bg="brand.accent"
            color="brand.bgMain"
            fontWeight="black"
            fontSize="10px"
            borderRadius="full"
            w="18px"
            h="18px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            pointerEvents="none"
            aria-hidden="true"
          >
            {totalItems}
          </Text>
        )}
      </Box>
    </Link>
  )
}