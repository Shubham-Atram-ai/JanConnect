-- CreateEnum
CREATE TYPE "SolutionStatus" AS ENUM ('DRAFT', 'SUBMITTED');

-- CreateTable
CREATE TABLE "Solution" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "problemStatement" TEXT NOT NULL,
    "proposedApproach" TEXT NOT NULL,
    "methodology" TEXT NOT NULL,
    "implementationPlan" TEXT NOT NULL,
    "requiredResources" TEXT NOT NULL,
    "expectedOutcome" TEXT NOT NULL,
    "expectedImpact" TEXT NOT NULL,
    "limitations" TEXT NOT NULL,
    "futureWork" TEXT NOT NULL,
    "status" "SolutionStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Solution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Solution_assignmentId_key" ON "Solution"("assignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Solution_workspaceId_key" ON "Solution"("workspaceId");

-- CreateIndex
CREATE INDEX "Solution_assignmentId_idx" ON "Solution"("assignmentId");

-- CreateIndex
CREATE INDEX "Solution_workspaceId_idx" ON "Solution"("workspaceId");

-- CreateIndex
CREATE INDEX "Solution_status_idx" ON "Solution"("status");

-- AddForeignKey
ALTER TABLE "Solution" ADD CONSTRAINT "Solution_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "UniversityAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solution" ADD CONSTRAINT "Solution_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "ResearchWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
