import { createSystem, defineConfig, defaultConfig } from "@chakra-ui/react"

const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          bgMain: { value: "#0D1117" },
          bgCard: { value: "#161B22" },
          accent: { value: "#00D1FF" },
          border: { value: "#21262D" },
          textMain: { value: "#E6EDF3" },
          textMuted: { value: "#8B949E" },
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