import { defineConfig } from "@prisma/config";
import { readFileSync } from "fs";
import { join } from "path";

// Buscamos el archivo .env manualmente
const envPath = join(process.cwd(), ".env");
const envFile = readFileSync(envPath, "utf-8");

// Buscamos la línea que empieza con DATABASE_URL usando una expresión regular
const match = envFile.match(/^DATABASE_URL=["']?(.+?)["']?$/m);
const databaseUrl = match ? match[1] : undefined;

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
});