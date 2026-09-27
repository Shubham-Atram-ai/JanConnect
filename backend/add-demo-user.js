const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://janconnect:secret@localhost:5432/janconnect?schema=public' });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: { passwordHash },
    create: {
      email: 'demo@example.com',
      passwordHash,
      role: 'CITIZEN'
    },
  });

  const demoAdmin = await prisma.user.upsert({
    where: { email: 'demoadmin@example.com' },
    update: { passwordHash },
    create: {
      email: 'demoadmin@example.com',
      passwordHash,
      role: 'PLATFORM_ADMIN'
    },
  });

  console.log('Created demo users:');
  console.log('Citizen:', demoUser.email);
  console.log('Admin:', demoAdmin.email);
  console.log('Password for all is: password123');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
