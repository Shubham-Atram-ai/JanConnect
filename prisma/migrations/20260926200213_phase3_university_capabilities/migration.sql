-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('RECOMMENDED', 'SENT', 'VIEWED', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ChallengeStatus" ADD VALUE 'MATCHING';
ALTER TYPE "ChallengeStatus" ADD VALUE 'MATCHED';
ALTER TYPE "ChallengeStatus" ADD VALUE 'DISTRIBUTED';

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'RESEARCHER';

-- AlterTable
ALTER TABLE "University" ADD COLUMN     "activeAssignments" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "capacity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "specializations" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "state" TEXT,
ADD COLUMN     "strengthDomains" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "Faculty" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" TEXT,
    "researchAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "domains" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Facility" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "capabilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "domains" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Facility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversityProject" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "domains" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "year" INTEGER,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UniversityProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeEmbedding" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'mock',
    "embedding" vector(1536),
    "inputHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallengeEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversityAssignment" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'RECOMMENDED',
    "matchScore" DOUBLE PRECISION NOT NULL,
    "matchBreakdown" JSONB,
    "matchExplanation" TEXT,
    "declineReason" TEXT,
    "recommendedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedAt" TIMESTAMP(3),
    "viewedAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UniversityAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Faculty_universityId_idx" ON "Faculty"("universityId");

-- CreateIndex
CREATE INDEX "Facility_universityId_idx" ON "Facility"("universityId");

-- CreateIndex
CREATE INDEX "UniversityProject_universityId_idx" ON "UniversityProject"("universityId");

-- CreateIndex
CREATE INDEX "ChallengeEmbedding_challengeId_idx" ON "ChallengeEmbedding"("challengeId");

-- CreateIndex
CREATE INDEX "UniversityAssignment_challengeId_idx" ON "UniversityAssignment"("challengeId");

-- CreateIndex
CREATE INDEX "UniversityAssignment_universityId_idx" ON "UniversityAssignment"("universityId");

-- CreateIndex
CREATE INDEX "UniversityAssignment_status_idx" ON "UniversityAssignment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "UniversityAssignment_challengeId_universityId_key" ON "UniversityAssignment"("challengeId", "universityId");

-- AddForeignKey
ALTER TABLE "Faculty" ADD CONSTRAINT "Faculty_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facility" ADD CONSTRAINT "Facility_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityProject" ADD CONSTRAINT "UniversityProject_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeEmbedding" ADD CONSTRAINT "ChallengeEmbedding_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityAssignment" ADD CONSTRAINT "UniversityAssignment_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityAssignment" ADD CONSTRAINT "UniversityAssignment_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;
