import { Box, Input, IconButton } from '@chakra-ui/react'
import { FaSearch } from 'react-icons/fa'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onSearch: () => void
  ariaLabel: string
  inputHeight?: string
  autoFocus?: boolean
}

export function SearchInput({
  value,
  onChange,
  onSearch,
  ariaLabel,
  inputHeight = '44px',
  autoFocus = false,
}: SearchInputProps) {
  return (
    <Box position="relative" w="full">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        placeholder="Buscar componentes..."
        aria-label={ariaLabel}
        autoFocus={autoFocus}
        borderRadius="full"
        bg="brand.bgMain"
        border="1px solid"
        borderColor="brand.border"
        color="brand.textMain"
        pl={5}
        pr="48px"
        h={inputHeight}
        fontSize="md"
        _placeholder={{ color: 'brand.textMuted' }}
        _focus={{
          borderColor: 'brand.accent',
          ring: '1px',
          ringColor: 'brand.accent',
          bg: 'brand.bgCard',
          outline: 'none',
        }}
      />
      <IconButton
        onClick={onSearch}
        aria-label="Ejecutar búsqueda"
        variant="ghost"
        color="brand.accent"
        h="36px"
        w="36px"
        position="absolute"
        right="4px"
        top="50%"
        transform="translateY(-50%)"
        borderRadius="full"
        zIndex={2}
        minW="unset"
        _hover={{ bg: 'brand.border' }}
        _focus={{ ring: '2px', ringColor: 'brand.accent', outline: 'none' }}
      >
        <FaSearch aria-hidden="true" size={13} />
      </IconButton>
    </Box>
  )
}