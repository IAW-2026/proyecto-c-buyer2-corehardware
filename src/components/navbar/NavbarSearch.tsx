'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Box, IconButton } from '@chakra-ui/react'
import { FaSearch, FaTimes } from 'react-icons/fa'
import { SearchInput } from '@/components/ui/SearchInput'

export function NavbarSearch() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSearch = () => {
    const current = new URLSearchParams(searchParams.toString())
    if (searchQuery.trim()) {
      current.set('search', searchQuery.trim())
    } else {
      current.delete('search')
    }
    current.set('page', '1')
    router.push(`/productos?${current.toString()}`)
  }

  return (
    <>
      {/* BÚSQUEDA DESKTOP */}
      <Box
        as="search"
        role="search"
        flex="1"
        maxW="700px"
        mx="auto"
        display={{ base: 'none', md: 'block' }}
      >
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          ariaLabel="Buscar productos"
          inputHeight="44px"
        />
      </Box>

      {/* LUPA / CRUZ — solo mobile */}
      <IconButton
        aria-label={searchOpen ? 'Cerrar barra de búsqueda' : 'Abrir barra de búsqueda'}
        aria-expanded={searchOpen}
        aria-controls="mobile-search"
        variant="ghost"
        color={searchOpen ? 'brand.accent' : 'brand.textMain'}
        rounded="full"
        h="44px"
        w="44px"
        display={{ base: 'flex', md: 'none' }}
        onClick={() => setSearchOpen((prev) => !prev)}
        _hover={{ bg: 'brand.border', color: 'brand.accent' }}
        _focus={{ ring: '2px', ringColor: 'brand.accent', outline: 'none' }}
      >
        {searchOpen
          ? <FaTimes aria-hidden="true" size={20} />
          : <FaSearch aria-hidden="true" size={16} />
        }
      </IconButton>

      {/* BÚSQUEDA MOBILE */}
      {searchOpen && (
        <Box
          as="search"
          id="mobile-search"
          role="search"
          display={{ base: 'block', md: 'none' }}
          mt={2}
        >
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            ariaLabel="Buscar productos en móvil"
            inputHeight="48px"
            autoFocus
          />
        </Box>
      )}
    </>
  )
}