import { Box, Text } from '@chakra-ui/react'

interface Props {
  label: string
  value: number | string
  color: string
}

export default function StatCard({ label, value, color }: Props) {
  return (
    <Box
      bg="brand.bgCard"
      border="1px solid"
      borderColor="brand.border"
      borderRadius="xl"
      p={5}
    >
      <Text fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider" mb={1}>
        {label}
      </Text>
      <Text fontSize="2xl" fontWeight="black" color={color}>
        {value}
      </Text>
    </Box>
  )
}