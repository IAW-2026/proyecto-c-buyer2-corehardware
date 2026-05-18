import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // La guía de Neon exige usar estrictamente la DIRECT_URL 
    // para todas las herramientas de consola de Prisma
    url: env('DIRECT_URL'),
  },
})