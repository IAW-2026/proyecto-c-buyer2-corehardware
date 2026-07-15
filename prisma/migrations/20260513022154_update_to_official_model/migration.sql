/*
  Warnings:

  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- DropTable
DROP TABLE "Order";

-- DropTable
DROP TABLE "Product";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Comprador" (
    "id" SERIAL NOT NULL,
    "dni" TEXT NOT NULL,
    "cuilCuit" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "sexo" TEXT,
    "direccion" TEXT NOT NULL,
    "mail" TEXT NOT NULL,
    "celular" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3) NOT NULL,
    "nacionalidad" TEXT NOT NULL,
    "condicionIva" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Comprador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "compradorId" INTEGER NOT NULL,
    "vendedorId" INTEGER NOT NULL,
    "productosId" INTEGER[],
    "monto" DOUBLE PRECISION NOT NULL,
    "estado" TEXT NOT NULL,
    "envioId" INTEGER,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Comprador_dni_key" ON "Comprador"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Comprador_cuilCuit_key" ON "Comprador"("cuilCuit");

-- CreateIndex
CREATE UNIQUE INDEX "Comprador_mail_key" ON "Comprador"("mail");

-- CreateIndex
CREATE UNIQUE INDEX "Comprador_clerkUserId_key" ON "Comprador"("clerkUserId");

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_compradorId_fkey" FOREIGN KEY ("compradorId") REFERENCES "Comprador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
