/*
  Warnings:

  - You are about to drop the column `isVerified` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "isVerified",
ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3);
