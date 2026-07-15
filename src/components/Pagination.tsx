'use client'
import { Flex, IconButton, Text } from '@chakra-ui/react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

interface PaginationProps {
  totalItems: number
  limit: number
  offset: number
  onPageChange: (newOffset: number) => void
}

export default function Pagination({ totalItems, limit, offset, onPageChange }: PaginationProps) {
  const currentPage = Math.floor(offset / limit) + 1
  const totalPages = Math.ceil(totalItems / limit)

  const hasPrev = currentPage > 1
  const hasNext = currentPage < totalPages

  return (
    <Flex justify="center" mt={16} gap="3" pb={12} align="center" role="navigation" aria-label="Paginación de productos">

      {/* BOTÓN ANTERIOR (FLECHA) */}
      <IconButton
        aria-label="Ir a la página anterior"
        variant="ghost"
        color="brand.accent"
        onClick={() => onPageChange(Math.max(0, offset - limit))}
        disabled={!hasPrev}
        _hover={hasPrev ? { bg: "brand.bgCard" } : {}}
        fontSize="18px"
        cursor={hasPrev ? "pointer" : "not-allowed"}
        opacity={hasPrev ? 1 : 0.3}
      >
        <FaChevronLeft />
      </IconButton>

      {/* PÁGINA ANTERIOR (NÚMERO) */}
      {hasPrev && (
        <Flex
          as="button"
          onClick={() => onPageChange((currentPage - 2) * limit)}
          w="44px" h="44px"
          align="center" justify="center"
          borderRadius="full"
          border="1px solid"
          borderColor="brand.border"
          color="brand.textMuted"
          fontWeight="medium"
          _hover={{ borderColor: "brand.accent", color: "brand.accent" }}
          cursor="pointer"
        >
          <Text>{currentPage - 1}</Text>
        </Flex>
      )}

      {/* PÁGINA ACTUAL (DESTACADA) */}
      <Flex
        bg="brand.accent"
        color="brand.bgMain"
        w="46px" h="46px"
        align="center" justify="center"
        borderRadius="full"
        fontWeight="black"
        boxShadow="0 0 15px rgba(0, 209, 255, 0.26)"
      >
        <Text>{currentPage}</Text>
      </Flex>

      {/* PÁGINA SIGUIENTE (NÚMERO) */}
      {hasNext && (
        <Flex
          as="button"
          onClick={() => onPageChange(currentPage * limit)}
          w="44px" h="44px"
          align="center" justify="center"
          borderRadius="full"
          border="1px solid"
          borderColor="brand.border"
          color="brand.textMuted"
          fontWeight="medium"
          _hover={{ borderColor: "brand.accent", color: "brand.accent" }}
          cursor="pointer"
        >
          <Text>{currentPage + 1}</Text>
        </Flex>
      )}

      {/* BOTÓN SIGUIENTE (FLECHA) */}
      <IconButton
        aria-label="Ir a la página siguiente"
        variant="ghost"
        color="brand.accent"
        onClick={() => onPageChange(offset + limit)}
        disabled={!hasNext}
        _hover={hasNext ? { bg: "brand.bgCard" } : {}}
        fontSize="18px"
        cursor={hasNext ? "pointer" : "not-allowed"}
        opacity={hasNext ? 1 : 0.3}
      >
        <FaChevronRight />
      </IconButton>

    </Flex>
  )
}