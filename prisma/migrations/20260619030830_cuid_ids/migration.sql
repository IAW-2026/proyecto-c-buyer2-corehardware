/*
  Warnings:

  - The primary key for the `Carrito` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CarritoItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Comprador` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Pedido` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Carrito" DROP CONSTRAINT "Carrito_compradorId_fkey";

-- DropForeignKey
ALTER TABLE "CarritoItem" DROP CONSTRAINT "CarritoItem_carritoId_fkey";

-- DropForeignKey
ALTER TABLE "Pedido" DROP CONSTRAINT "Pedido_compradorId_fkey";

-- AlterTable
ALTER TABLE "Carrito" DROP CONSTRAINT "Carrito_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "compradorId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Carrito_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Carrito_id_seq";

-- AlterTable
ALTER TABLE "CarritoItem" DROP CONSTRAINT "CarritoItem_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "carritoId" SET DATA TYPE TEXT,
ALTER COLUMN "productoId" SET DATA TYPE TEXT,
ALTER COLUMN "vendedorId" DROP DEFAULT,
ALTER COLUMN "vendedorId" SET DATA TYPE TEXT,
ADD CONSTRAINT "CarritoItem_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CarritoItem_id_seq";

-- AlterTable
ALTER TABLE "Comprador" DROP CONSTRAINT "Comprador_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Comprador_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Comprador_id_seq";

-- AlterTable
ALTER TABLE "Pedido" DROP CONSTRAINT "Pedido_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "compradorId" SET DATA TYPE TEXT,
ALTER COLUMN "vendedorId" SET DATA TYPE TEXT,
ALTER COLUMN "productosId" SET DATA TYPE TEXT[],
ALTER COLUMN "envioId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Pedido_id_seq";

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_compradorId_fkey" FOREIGN KEY ("compradorId") REFERENCES "Comprador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Carrito" ADD CONSTRAINT "Carrito_compradorId_fkey" FOREIGN KEY ("compradorId") REFERENCES "Comprador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarritoItem" ADD CONSTRAINT "CarritoItem_carritoId_fkey" FOREIGN KEY ("carritoId") REFERENCES "Carrito"("id") ON DELETE CASCADE ON UPDATE CASCADE;
