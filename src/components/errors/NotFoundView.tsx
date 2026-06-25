'use client'

import { Flex, Heading, Text, VStack, Icon } from '@chakra-ui/react'
import { FaExclamationTriangle } from 'react-icons/fa'
import { NotFoundViewLink } from './NotFoundViewLink'
import { brandColors } from '@/styles/colors'

export default function NotFoundView() {
  return (
    <Flex minH="80vh" align="center" justify="center" bg={brandColors.bgMain} px={4}>
      <VStack gap={6} textAlign="center">
        <Icon as={FaExclamationTriangle} boxSize={16} color={brandColors.accent} aria-hidden="true" />
        <VStack gap={2}>
          <Heading as="h1" fontSize="6xl" fontWeight="black" color={brandColors.textMain} fontFamily="mono">
            404
          </Heading>
          <Heading as="h2" fontSize="xl" fontWeight="semibold" color={brandColors.textMain}>
            Página no encontrada
          </Heading>
          <Text color={brandColors.textMuted} maxW="360px">
            La página que buscás no existe o fue movida.
          </Text>
        </VStack>
        <NotFoundViewLink />
      </VStack>
    </Flex>
  )
}