import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.notification.deleteMany();
  await prisma.challengeAuditLog.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.match.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.facility.deleteMany();
  await prisma.university.deleteMany();
  await prisma.industry.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
  console.log('Database wiped.');
}
main().catch(console.error).finally(() => prisma.$disconnect());
