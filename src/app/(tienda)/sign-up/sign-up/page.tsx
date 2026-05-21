
'use client'

import { Flex, Box } from '@chakra-ui/react'
import { SignUp } from '@clerk/nextjs'
import { brandColors } from '../../../../styles/colors' 

export default function SignUpPage() {
  return (
    <Flex
      justify="center"
      align="center"
      minH="100vh"
      bg="brand.bgMain" 
    >
      <Box
        borderRadius="md"
        boxShadow="0 0 20px brand.accent/15" 
      >
        <SignUp appearance={{
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