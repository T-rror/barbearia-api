-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDENTE', 'CONCLUIDO', 'CANCELADO');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ADMIN';

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'PENDENTE';
