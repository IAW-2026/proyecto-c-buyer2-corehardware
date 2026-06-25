'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Box, Flex, Text, Input, Icon } from '@chakra-ui/react'
import { FaSearch } from 'react-icons/fa'

export default function BuscadorCompradores({ search }: { search: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(search)

  const updateUrl = (term: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('offset', '0')
    term ? params.set('search', term) : params.delete('search')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Box bg="brand.bgCard" border="1px solid" borderColor="brand.border" borderRadius="xl" p={5} mb={6}>
      <Text fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider" mb={3}>
        Buscar
      </Text>
      <Flex gap={3}>
        <Input
          placeholder="Nombre, apellido, mail o DNI..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && updateUrl(value)}
          bg="brand.bgMain" border="1px solid" borderColor="brand.border"
          color="brand.textMain" size="sm" borderRadius="lg"
          _focus={{ borderColor: 'brand.accent', outline: 'none' }}
        />
        {search && (
          <Box as="button" px={4} py={2} border="1px solid" borderColor="brand.border" borderRadius="lg" color="brand.textMuted" fontSize="sm" flexShrink={0} _hover={{ borderColor: 'brand.accent', color: 'brand.accent' }} onClick={() => { setValue(''); updateUrl('') }}>
            Limpiar
          </Box>
        )}
        <Box as="button" px={5} py={2} bg="brand.accent" color="brand.bgMain" borderRadius="lg" fontSize="sm" fontWeight="bold" flexShrink={0} _hover={{ opacity: 0.85 }} onClick={() => updateUrl(value)} aria-label="Buscar compradores">
          <Icon as={FaSearch} boxSize={3} />
        </Box>
      </Flex>
    </Box>
  )
}