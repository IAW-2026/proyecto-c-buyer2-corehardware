// src/app/sign-in/[[...sign-in]]/page.tsx (y también en el sign-up)
'use client'
import { Flex, Box } from '@chakra-ui/react'
import { SignIn } from '@clerk/nextjs'
import { brandColors } from '../../../../styles/colors' // 🚀 Ruta corregida

export default function SignInPage() {
  return (
    <Flex justify="center" align="center" minH="100vh" bg="brand.bgMain">
      <Box borderRadius="md" boxShadow="0 0 20px brand.accent/15">
        <SignIn appearance={{
          variables: {
            colorPrimary: brandColors.accent,
            colorBackground: brandColors.bgCard,
            colorText: brandColors.textMain,
            colorTextSecondary: brandColors.textMuted,
            colorInputBackground: brandColors.bgMain,
            colorInputText: brandColors.textMain,
          },
          elements: {
            modalOverlay: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0, 0, 0, 0.65)", // De paso le da un fondo oscuro traslúcido lindo
            },
            modalContent: {
              margin: "0 auto !important", // Elimina el margen superior que lo empuja hacia arriba
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
            card: {
              margin: "0 auto !important", // Fuerza a la tarjeta a centrarse
            }
          }
        }} />
      </Box>
    </Flex>
  )
}