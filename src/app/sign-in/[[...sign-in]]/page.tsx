'use client'
import { Flex, Box } from '@chakra-ui/react'
import { SignIn } from '@clerk/nextjs'
import { brandColors } from '@/styles/colors'

export default function SignInPage() {
  return (
    <Flex justify="center" align="center" minH="100vh" bg="brand.bgMain">
      <Box borderRadius="md">
        <SignIn appearance={{
          variables: {
            colorPrimary: brandColors.accent,
            colorBackground: brandColors.bgCard,
            colorText: brandColors.textMain,
            colorTextSecondary: brandColors.textMuted,
            colorInputBackground: brandColors.bgMain,
            colorInputText: brandColors.textMain,
          }
        }} />
      </Box>
    </Flex>
  )
}