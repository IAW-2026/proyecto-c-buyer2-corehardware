'use client'

import { Flex, Text, Box } from '@chakra-ui/react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

interface Props {
    totalItems: number
    limit: number
    offset: number
    onPageChange: (newOffset: number) => void
}

export default function PaginationAdmin({ totalItems, limit, offset, onPageChange }: Props) {
    const totalPages = Math.ceil(totalItems / limit)
    const currentPage = Math.floor(offset / limit) + 1

    if (totalPages <= 1) return null

    const pages: (number | '...')[] = []

    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
        pages.push(1)
        if (currentPage > 3) pages.push('...')
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            pages.push(i)
        }
        if (currentPage < totalPages - 2) pages.push('...')
        pages.push(totalPages)
    }

    const goTo = (page: number) => onPageChange((page - 1) * limit)

    return (
        <Flex align="center" justify="flex-end" gap={1} mt={4}>

            {/* Prev */}
            <Box
                as="button"
                onClick={() => currentPage > 1 && goTo(currentPage - 1)}
                aria-disabled={currentPage === 1}
                w="30px" h="30px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="md"
                border="1px solid"
                borderColor="brand.border"
                color={currentPage === 1 ? 'brand.textMuted' : 'brand.textMain'}
                opacity={currentPage === 1 ? 0.4 : 1}
                cursor={currentPage === 1 ? 'not-allowed' : 'pointer'}
                _hover={currentPage === 1 ? {} : { borderColor: 'brand.accent', color: 'brand.accent' }}
                transition="all 0.15s"
                aria-label="Página anterior"
            >
                <FaChevronLeft size={10} />
            </Box>

            {/* Páginas */}
            {pages.map((page, i) =>
                page === '...' ? (
                    <Text key={`ellipsis-${i}`} fontSize="xs" color="brand.textMuted" px={1}>
                        …
                    </Text>
                ) : (
                    <Box
                        key={page}
                        as="button"
                        onClick={() => goTo(page)}
                        w="30px" h="30px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="md"
                        border="1px solid"
                        borderColor={currentPage === page ? 'brand.accent' : 'brand.border'}
                        bg={currentPage === page ? 'rgba(0,209,255,0.08)' : 'transparent'}
                        color={currentPage === page ? 'brand.accent' : 'brand.textMuted'}
                        fontSize="xs"
                        fontWeight={currentPage === page ? 'bold' : 'normal'}
                        cursor="pointer"
                        _hover={{ borderColor: 'brand.accent', color: 'brand.accent' }}
                        transition="all 0.15s"
                        aria-label={`Ir a página ${page}`}
                        aria-current={currentPage === page ? 'page' : undefined}
                    >
                        {page}
                    </Box>
                )
            )}

            {/* Next */}
            <Box
                as="button"
                onClick={() => currentPage < totalPages && goTo(currentPage + 1)}
                aria-disabled={currentPage === totalPages}
                w="30px" h="30px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="md"
                border="1px solid"
                borderColor="brand.border"
                color={currentPage === totalPages ? 'brand.textMuted' : 'brand.textMain'}
                opacity={currentPage === totalPages ? 0.4 : 1}
                cursor={currentPage === totalPages ? 'not-allowed' : 'pointer'}
                _hover={currentPage === totalPages ? {} : { borderColor: 'brand.accent', color: 'brand.accent' }}
                transition="all 0.15s"
                aria-label="Página siguiente"
            >
                <FaChevronRight size={10} />
            </Box>

        </Flex>
    )
}