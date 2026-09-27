-- CreateEnum
CREATE TYPE "WorkspaceStatus" AS ENUM ('ACTIVE', 'PAUSED', 'READY_FOR_SOLUTION', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('FACULTY_LEAD', 'FACULTY', 'RESEARCHER', 'PHD_RESEARCHER', 'STUDENT');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "NoteType" AS ENUM ('OBSERVATION', 'LITERATURE_REVIEW', 'HYPOTHESIS', 'METHODOLOGY', 'EXPERIMENT', 'ANALYSIS', 'FINDING', 'GENERAL');

-- CreateEnum
CREATE TYPE "FindingStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'REJECTED');

-- CreateTable
CREATE TABLE "ResearchWorkspace" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "WorkspaceStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchWorkspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchTeam" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "facultyLeadId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchTeamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "TeamRole" NOT NULL DEFAULT 'STUDENT',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ResearchTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchTask" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assignedTo" TEXT,
    "createdBy" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchNote" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "noteType" "NoteType" NOT NULL DEFAULT 'GENERAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchEvidence" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'DOCUMENT',
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResearchEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchReference" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "addedBy" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "citation" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResearchReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchFinding" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidenceIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "FindingStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchFinding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchDiscussion" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResearchDiscussion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResearchWorkspace_assignmentId_key" ON "ResearchWorkspace"("assignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchTeam_workspaceId_key" ON "ResearchTeam"("workspaceId");

-- CreateIndex
CREATE INDEX "ResearchTeamMember_teamId_idx" ON "ResearchTeamMember"("teamId");

-- CreateIndex
CREATE INDEX "ResearchTeamMember_userId_idx" ON "ResearchTeamMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchTeamMember_teamId_userId_key" ON "ResearchTeamMember"("teamId", "userId");

-- CreateIndex
CREATE INDEX "ResearchTask_workspaceId_idx" ON "ResearchTask"("workspaceId");

-- CreateIndex
CREATE INDEX "ResearchTask_assignedTo_idx" ON "ResearchTask"("assignedTo");

-- CreateIndex
CREATE INDEX "ResearchNote_workspaceId_idx" ON "ResearchNote"("workspaceId");

-- CreateIndex
CREATE INDEX "ResearchNote_authorId_idx" ON "ResearchNote"("authorId");

-- CreateIndex
CREATE INDEX "ResearchEvidence_workspaceId_idx" ON "ResearchEvidence"("workspaceId");

-- CreateIndex
CREATE INDEX "ResearchReference_workspaceId_idx" ON "ResearchReference"("workspaceId");

-- CreateIndex
CREATE INDEX "ResearchFinding_workspaceId_idx" ON "ResearchFinding"("workspaceId");

-- CreateIndex
CREATE INDEX "ResearchDiscussion_workspaceId_idx" ON "ResearchDiscussion"("workspaceId");

-- AddForeignKey
ALTER TABLE "ResearchWorkspace" ADD CONSTRAINT "ResearchWorkspace_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "UniversityAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchTeam" ADD CONSTRAINT "ResearchTeam_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "ResearchWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchTeamMember" ADD CONSTRAINT "ResearchTeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "ResearchTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchTeamMember" ADD CONSTRAINT "ResearchTeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchTask" ADD CONSTRAINT "ResearchTask_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "ResearchWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchNote" ADD CONSTRAINT "ResearchNote_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "ResearchWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchEvidence" ADD CONSTRAINT "ResearchEvidence_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "ResearchWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchReference" ADD CONSTRAINT "ResearchReference_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "ResearchWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchFinding" ADD CONSTRAINT "ResearchFinding_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "ResearchWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchDiscussion" ADD CONSTRAINT "ResearchDiscussion_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "ResearchWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
