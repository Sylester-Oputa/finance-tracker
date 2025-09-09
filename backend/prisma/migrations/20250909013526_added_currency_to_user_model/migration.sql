/*
  Warnings:

  - Added the required column `currency` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `Income` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Expense" ADD COLUMN     "currency" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Income" ADD COLUMN     "currency" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "defaultCurrency" TEXT;
