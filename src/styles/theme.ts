import { createSystem, defineConfig, defaultConfig } from "@chakra-ui/react"
import { brandColors } from "./colors"

const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          bgMain: { value: brandColors.bgMain },
          bgCard: { value: brandColors.bgCard },
          accent: { value: brandColors.accent },
          border: { value: brandColors.border },
          textMain: { value: brandColors.textMain },
          textMuted: { value: brandColors.textMuted },
          danger: { value: brandColors.danger }
        },
      },
    },
    semanticTokens: {
      colors: {
        // Mapea los tokens semánticos del sistema a tus colores brand
        background: { value: "{colors.brand.bgMain}" },
        text: { value: "{colors.brand.textMain}" },
      },
    },
  },
  // Forza a que el HTML/Body adopte estos colores globales sin usar CSS tradicional
  globalCss: {
    body: {
      bg: "brand.bgMain",
      color: "brand.textMain",
    },
  },
})

export const system = createSystem(defaultConfig, customConfig)