import { PrismaClient, Role, ChallengeStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
const pool = new Pool({
    connectionString: process.env.DATABASE_URL ||
        'postgresql://janconnect:secret@localhost:5432/janconnect?schema=public',
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
async function main() {
    console.log('Seeding database...');
    // Create Organizations
    const govtOrg = await prisma.organization.upsert({
        where: { id: 'org-govt-jharkhand' },
        update: {},
        create: { id: 'org-govt-jharkhand', name: 'Government of Jharkhand', type: 'GOVERNMENT' },
    });
    const uniAgriculture = await prisma.organization.upsert({
        where: { id: 'org-agri-uni' },
        update: {},
        create: {
            id: 'org-agri-uni', name: 'Birsa Agricultural University', type: 'UNIVERSITY',
            university: {
                create: {
                    description: 'Premier agricultural university in Jharkhand.', website: 'https://bau.edu.in',
                    state: 'Jharkhand', district: 'Ranchi', capacity: 10,
                    strengthDomains: ['Agriculture', 'Forestry', 'Animal Husbandry'],
                    faculties: {
                        create: [
                            { name: 'Dr. Ramesh Kumar', department: 'Agriculture', researchAreas: ['Crop Resilience', 'Soil Science'], skills: ['Agricultural Engineering', 'Soil Science'] }
                        ]
                    },
                    facilities: {
                        create: [
                            { name: 'Advanced Soil Testing Lab', capabilities: ['Soil Testing', 'Moisture Analysis'], domains: ['Agriculture'] }
                        ]
                    }
                }
            }
        }
    });
    const uniTech = await prisma.organization.upsert({
        where: { id: 'org-jtu' },
        update: {},
        create: {
            id: 'org-jtu', name: 'Jharkhand Tech University', type: 'UNIVERSITY',
            university: {
                create: {
                    description: 'Leading technical institute.', state: 'Jharkhand', district: 'Ranchi', capacity: 5,
                    strengthDomains: ['Technology', 'Infrastructure', 'Computer Science'],
                    faculties: {
                        create: [
                            { name: 'Dr. Suresh IT', department: 'Computer Science', researchAreas: ['AI', 'Data Science'], skills: ['AI', 'ML', 'Data Analysis'] },
                            { name: 'Prof. Civil', department: 'Civil Engineering', researchAreas: ['Roads', 'Bridges'], skills: ['Civil Engineering', 'Drainage Engineering'] }
                        ]
                    }
                }
            }
        }
    });
    const uniWater = await prisma.organization.upsert({
        where: { id: 'org-water-inst' },
        update: {},
        create: {
            id: 'org-water-inst', name: 'Institute of Water Management', type: 'UNIVERSITY',
            university: {
                create: {
                    description: 'Specializes in water engineering.', state: 'Jharkhand', district: 'Hazaribagh', capacity: 8,
                    strengthDomains: ['Water', 'Public Health'],
                    faculties: {
                        create: [
                            { name: 'Dr. Jal', researchAreas: ['Water Contamination'], skills: ['Water Engineering', 'Public Health'] }
                        ]
                    }
                }
            }
        }
    });
    const indOrg = await prisma.organization.upsert({
        where: { id: 'org-techcorp' },
        update: {},
        create: {
            id: 'org-techcorp', name: 'Tech Corp India', type: 'INDUSTRY', industry: { create: {} },
        },
    });
    const passwordHash = await bcrypt.hash('password123', 10);
    // Create Users
    const users = [
        { email: 'citizen@example.com', passwordHash, role: Role.CITIZEN },
        { email: 'citizen2@example.com', passwordHash, role: Role.CITIZEN },
        { email: 'govadmin@example.com', passwordHash, role: Role.GOVERNMENT_ADMIN, organizationId: govtOrg.id },
        { email: 'uniadmin@example.com', passwordHash, role: Role.UNIVERSITY_ADMIN, organizationId: uniTech.id },
        { email: 'agriadmin@example.com', passwordHash, role: Role.UNIVERSITY_ADMIN, organizationId: uniAgriculture.id },
        { email: 'wateradmin@example.com', passwordHash, role: Role.UNIVERSITY_ADMIN, organizationId: uniWater.id },
        { email: 'faculty@example.com', passwordHash, role: Role.FACULTY, organizationId: uniTech.id },
        { email: 'student@example.com', passwordHash, role: Role.STUDENT, organizationId: uniTech.id },
        { email: 'industry@example.com', passwordHash, role: Role.INDUSTRY_PARTNER, organizationId: indOrg.id },
        { email: 'platformadmin@example.com', passwordHash, role: Role.PLATFORM_ADMIN },
        { email: 'expert@example.com', passwordHash, role: Role.DOMAIN_EXPERT },
    ];
    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: user,
        });
    }
    // Get citizen user
    const citizen = await prisma.user.findUnique({ where: { email: 'citizen@example.com' } });
    if (!citizen)
        throw new Error('Citizen user not created');
    // Create sample submitted challenges for dashboard testing
    const sampleChallenges = [
        {
            challengeCode: 'JC-0001',
            title: 'Annual rainfall causes crop yield reduction',
            summary: 'Heavy rainfall causes waterlogging in agricultural fields every year, reducing crop production.',
            domain: 'Agriculture',
            subdomain: 'Crop Resilience',
            problemType: 'Climate-related agricultural impact',
            requiredSkills: ['Agricultural Engineering', 'Hydrology', 'Soil Science'],
            tags: ['rainfall', 'waterlogging', 'agriculture', 'crop-loss'],
            state: 'Jharkhand',
            district: 'Ranchi',
            village: 'Namkum',
            status: ChallengeStatus.SUBMITTED,
            originalTranscript: 'हर साल बहुत ज्यादा बारिश होने के कारण हमारे खेत में पानी भर जाता है और फसल खराब हो जाती है।',
            originalLanguage: 'hi',
        },
        {
            challengeCode: 'JC-0002',
            title: 'Village water supply contamination',
            summary: 'Drinking water supply in the village has been contaminated causing illness.',
            domain: 'Water',
            subdomain: 'Drinking Water Quality',
            problemType: 'Water contamination',
            requiredSkills: ['Water Engineering', 'Public Health', 'Environmental Science'],
            tags: ['water-contamination', 'drinking-water', 'public-health'],
            state: 'Jharkhand',
            district: 'Hazaribagh',
            village: 'Barhi',
            status: ChallengeStatus.SUBMITTED,
            originalTranscript: 'The water supply in our village has been contaminated and people are falling sick.',
            originalLanguage: 'en',
        },
        {
            challengeCode: 'JC-0003',
            title: 'Deteriorating road in monsoon season',
            summary: 'Village road becomes unusable during monsoon, cutting off access.',
            domain: 'Infrastructure',
            subdomain: 'Rural Road Infrastructure',
            problemType: 'Transportation connectivity failure',
            requiredSkills: ['Civil Engineering', 'Drainage Engineering'],
            tags: ['road', 'infrastructure', 'flooding'],
            state: 'Jharkhand',
            district: 'Bokaro',
            village: 'Chas',
            status: ChallengeStatus.DRAFT,
            originalTranscript: 'Hamari gaon ki sadak bahut kharab hai.',
            originalLanguage: 'hi',
        },
    ];
    for (const ch of sampleChallenges) {
        const existing = await prisma.challenge.findUnique({ where: { challengeCode: ch.challengeCode } });
        if (!existing) {
            const created = await prisma.challenge.create({
                data: { ...ch, citizenId: citizen.id },
            });
            // Create audit log
            await prisma.challengeAuditLog.create({
                data: {
                    challengeId: created.id,
                    actorId: citizen.id,
                    action: 'CHALLENGE_CREATED',
                    entityType: 'Challenge',
                },
            });
            if (ch.status === ChallengeStatus.SUBMITTED) {
                await prisma.challengeAuditLog.create({
                    data: {
                        challengeId: created.id,
                        actorId: citizen.id,
                        action: 'CHALLENGE_SUBMITTED',
                        entityType: 'Challenge',
                    },
                });
                await prisma.notification.create({
                    data: {
                        userId: citizen.id,
                        title: 'Problem submitted successfully',
                        body: `Your problem ${ch.challengeCode} has been submitted. AI university matching will begin soon.`,
                        type: 'CHALLENGE_SUBMITTED',
                        entityId: created.id,
                    },
                });

                // Create an accepted assignment for JC-0001 for Phase 4 testing
                if (ch.challengeCode === 'JC-0001') {
                    const uniOrg = await prisma.organization.findUnique({ where: { id: 'org-jtu' }, include: { university: true } });
                    const uniUser = await prisma.user.findUnique({ where: { email: 'uniadmin@example.com' } });
                    const facultyUser = await prisma.user.findUnique({ where: { email: 'faculty@example.com' } });
                    
                    if (uniOrg?.university && uniUser && facultyUser) {
                        const assignment = await prisma.universityAssignment.create({
                            data: {
                                challengeId: created.id,
                                universityId: uniOrg.university.id,
                                status: 'ACCEPTED',
                                matchScore: 92.5,
                                matchExplanation: 'High domain alignment with Civil & Agricultural drainage capabilities.',
                                respondedAt: new Date(),
                            }
                        });

                        const workspace = await prisma.researchWorkspace.create({
                            data: {
                                assignmentId: assignment.id,
                                title: 'Crop Waterlogging Mitigation Research Workspace',
                                description: 'Collaborative study on soil permeability and drainage interventions for JC-0001',
                                status: 'ACTIVE',
                                team: {
                                    create: {
                                        name: 'Crop Resilience & Drainage Team',
                                        description: 'Primary research team for soil and waterlogging interventions',
                                        facultyLeadId: facultyUser.id,
                                        members: {
                                            create: [
                                                { userId: facultyUser.id, role: 'FACULTY_LEAD' },
                                                { userId: uniUser.id, role: 'FACULTY' },
                                            ]
                                        }
                                    }
                                },
                                tasks: {
                                    create: [
                                        { title: 'Rainfall & soil drainage analysis', description: 'Study 5-year historical rainfall data', createdBy: facultyUser.id, status: 'COMPLETED', priority: 'HIGH' },
                                        { title: 'Design prototype drainage intervention', description: 'Create blueprint for subsurface drainage', createdBy: facultyUser.id, status: 'IN_PROGRESS', priority: 'MEDIUM' }
                                    ]
                                },
                                notes: {
                                    create: [
                                        { authorId: facultyUser.id, title: 'Initial Field Observations', content: 'Soil drainage capacity is insufficient during peak monsoon weeks.', noteType: 'OBSERVATION' }
                                    ]
                                },
                                evidence: {
                                    create: [
                                        { uploadedBy: facultyUser.id, title: 'Historical Rainfall Dataset (2021-2025)', storageKey: 'rainfall-data-2026.csv', mimeType: 'text/csv', fileSize: 512000 }
                                    ]
                                },
                                findings: {
                                    create: [
                                        { createdBy: facultyUser.id, title: 'Subsurface Waterlogging Bottleneck', description: 'Primary cause of yield drop is clay layer compaction at 1.5m depth.', status: 'CONFIRMED' }
                                    ]
                                }
                            }
                        });
                    }
                }
            }
        }
    }
    console.log('Database seeded successfully.');
    console.log('\nDemo accounts (password: password123):');
    console.log('  citizen@example.com     → CITIZEN');
    console.log('  govadmin@example.com    → GOVERNMENT_ADMIN');
    console.log('  uniadmin@example.com    → UNIVERSITY_ADMIN');
    console.log('  platformadmin@example.com → PLATFORM_ADMIN');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
});
