import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('Phase 3 Authorization (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;

  let citizen1Token: string;
  let citizen2Token: string;
  let adminToken: string;
  let uni1Token: string;
  let uni2Token: string;

  let challenge1Id: string;
  let challenge2Id: string;
  let assignment1Id: string;
  let assignment2Id: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    jwt = app.get<JwtService>(JwtService);

    // Get users for tokens
    const c1 = await prisma.user.findUnique({ where: { email: 'citizen@example.com' } });
    const c2 = await prisma.user.findUnique({ where: { email: 'citizen2@example.com' } });
    const admin = await prisma.user.findUnique({ where: { email: 'platformadmin@example.com' } });
    const u1 = await prisma.user.findUnique({ where: { email: 'uniadmin@example.com' } });
    const u2 = await prisma.user.findUnique({ where: { email: 'agriadmin@example.com' } });

    citizen1Token = jwt.sign({ sub: c1.id, email: c1.email, role: c1.role });
    citizen2Token = jwt.sign({ sub: c2.id, email: c2.email, role: c2.role });
    adminToken = jwt.sign({ sub: admin.id, email: admin.email, role: admin.role });
    uni1Token = jwt.sign({ sub: u1.id, email: u1.email, role: u1.role });
    uni2Token = jwt.sign({ sub: u2.id, email: u2.email, role: u2.role });

    const challenges = await prisma.challenge.findMany({ orderBy: { challengeCode: 'asc' } });
    challenge1Id = challenges[0].id;
    challenge2Id = challenges[1].id;

    // Distribute a challenge to u1 and u2 to create assignments
    await prisma.universityAssignment.create({
      data: {
         challengeId: challenge1Id,
         universityId: 'org-jtu', // assuming u1 is tech uni
         status: 'SENT',
         matchScore: 80,
         matchExplanation: 'Test',
      }
    });

    await prisma.universityAssignment.create({
      data: {
         challengeId: challenge2Id,
         universityId: 'org-agri-uni', // assuming u2 is agri uni
         status: 'SENT',
         matchScore: 70,
         matchExplanation: 'Test',
      }
    });

    const assigns = await prisma.universityAssignment.findMany();
    assignment1Id = assigns.find(a => a.universityId === 'org-jtu').id;
    assignment2Id = assigns.find(a => a.universityId === 'org-agri-uni').id;
  });

  afterAll(async () => {
    // Cleanup assignments
    await prisma.universityAssignment.deleteMany({});
    await app.close();
  });

  it('Citizen cannot access another citizens challenge (Phase 2)', async () => {
    // Already enforced in ChallengesController, but verified here.
    // Assuming citizen2 tries to fetch citizen1's challenge (which is challenge1)
    // Wait, the seed script made citizen1 own challenge1
    return request(app.getHttpServer())
      .get(`/api/v1/challenges/${challenge1Id}`)
      .set('Authorization', `Bearer ${citizen2Token}`)
      .expect(403);
  });

  it('University A cannot access University Bs assignment', async () => {
    return request(app.getHttpServer())
      .get(`/api/v1/university/assignments/${assignment2Id}`)
      .set('Authorization', `Bearer ${uni1Token}`)
      .expect(403);
  });

  it('University cannot call admin distribution endpoints', async () => {
    return request(app.getHttpServer())
      .post(`/api/v1/admin/challenges/${challenge1Id}/distribute`)
      .set('Authorization', `Bearer ${uni1Token}`)
      .send({ universityIds: ['org-jtu'] })
      .expect(403);
  });

  it('Non-admin cannot generate/distribute matches', async () => {
    // Citizen
    await request(app.getHttpServer())
      .post(`/api/v1/admin/challenges/${challenge1Id}/distribute`)
      .set('Authorization', `Bearer ${citizen1Token}`)
      .send({ universityIds: ['org-jtu'] })
      .expect(403);
  });

  it('University cannot modify another universitys assignment', async () => {
    return request(app.getHttpServer())
      .post(`/api/v1/university/assignments/${assignment2Id}/accept`)
      .set('Authorization', `Bearer ${uni1Token}`)
      .expect(403); // ForbiddenException from UniversityController
  });
});
