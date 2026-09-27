import { PrismaClient, Role, ChallengeStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
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
  if (!citizen) throw new Error('Citizen user not created');

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
      }
    }
  }

  // Phase 4 & 5 Seed Data: Multi-University Demo
  // JC-0001 gets 3 universities with independent workspaces and solutions
  const challenge1 = await prisma.challenge.findUnique({ where: { challengeCode: 'JC-0001' } });
  if (challenge1) {
    await prisma.challenge.update({
      where: { id: challenge1.id },
      data: { status: 'DISTRIBUTED' },
    });

    const uniAgriUniversity = await prisma.university.findUnique({ where: { organizationId: uniAgriculture.id } });
    const uniTechUniversity = await prisma.university.findUnique({ where: { organizationId: uniTech.id } });
    const uniWaterUniversity = await prisma.university.findUnique({ where: { organizationId: uniWater.id } });

    const agriadminUser = await prisma.user.findFirst({ where: { email: 'agriadmin@example.com' } });
    const uniadminUser = await prisma.user.findFirst({ where: { email: 'uniadmin@example.com' } });
    const wateradminUser = await prisma.user.findFirst({ where: { email: 'wateradmin@example.com' } });

    // ── University A: Birsa Agricultural University ──
    const assignment1 = await prisma.universityAssignment.upsert({
      where: { challengeId_universityId: { challengeId: challenge1.id, universityId: uniAgriUniversity!.id } },
      update: { status: 'ACCEPTED' },
      create: {
        challengeId: challenge1.id,
        universityId: uniAgriUniversity!.id,
        status: 'ACCEPTED',
        matchScore: 0.95,
        matchExplanation: 'Excellent match: Premier agricultural university with soil science labs and crop resilience expertise. Faculty specializing in waterlogging mitigation.',
        recommendedAt: new Date(),
        assignedAt: new Date(),
      },
    });

    const workspace1 = await prisma.researchWorkspace.upsert({
      where: { assignmentId: assignment1.id },
      update: {},
      create: {
        assignmentId: assignment1.id,
        status: 'READY_FOR_SOLUTION',
        title: 'Agricultural Waterlogging Resilience Project',
        description: 'Developing sustainable drainage systems for Namkum village fields using soil science expertise.',
      },
    });

    await prisma.researchTeam.upsert({
      where: { workspaceId: workspace1.id },
      update: {},
      create: {
        workspaceId: workspace1.id,
        name: 'BAU Soil Science Team',
        facultyLeadId: agriadminUser!.id,
        members: { create: { userId: agriadminUser!.id, role: 'FACULTY_LEAD' } }
      }
    });

    const existingFinding1 = await prisma.researchFinding.findFirst({ where: { workspaceId: workspace1.id } });
    if (!existingFinding1) {
      await prisma.researchFinding.create({
        data: {
          workspaceId: workspace1.id,
          title: 'Soil permeability is extremely low',
          description: 'Tests show that the local soil has heavy clay content (>60%) reducing natural drainage significantly. pH levels indicate acidic conditions that further compact soil.',
          status: 'CONFIRMED',
          createdBy: agriadminUser!.id,
        }
      });
    }

    const existingSolution1 = await prisma.solution.findUnique({ where: { workspaceId: workspace1.id } });
    if (!existingSolution1) {
      await prisma.solution.create({
        data: {
          workspaceId: workspace1.id,
          assignmentId: assignment1.id,
          status: 'SUBMITTED',
          title: 'Integrated Subsurface Drainage System',
          summary: 'A low-cost subsurface drainage mechanism using locally available materials designed for heavy clay soil conditions in the Chotanagpur Plateau region.',
          problemStatement: 'Heavy rainfall in Namkum causes severe waterlogging due to high clay content (>60%) in soil, resulting in prolonged standing water that destroys rice and vegetable crops.',
          proposedApproach: 'Install perforated PVC pipes covered with gravel at 1m depth in a herringbone pattern following natural contours, combined with raised-bed farming for critical crop areas.',
          methodology: 'Grid-based installation prioritizing natural slopes. Soil testing at 50m intervals, pipe diameter calibrated to local rainfall intensity data. Pilot in 2-hectare test plot with control plot comparison.',
          implementationPlan: 'Phase 1: Topographic survey and soil mapping (1 week). Phase 2: Excavation and pipe laying (3 weeks). Phase 3: Gravel filling and surface restoration (1 week). Phase 4: Monsoon testing and monitoring (3 months).',
          requiredResources: '4-inch perforated PVC pipes (2km), gravel aggregate (50 tonnes), excavation equipment, local labor team (15 workers), soil testing kits, moisture sensors.',
          expectedOutcome: 'Reduction of standing water duration from 7 days to under 24 hours. Soil moisture maintained at optimal levels for rice cultivation during post-monsoon period.',
          expectedImpact: '40% increase in crop yield for 200+ affected farming families. Estimated annual economic benefit of ₹15 lakh for the village.',
          limitations: 'May require maintenance every 5 years. Initial cost of ₹3 lakh per hectare. Not suitable for areas with rock substrate below 80cm.',
          futureWork: 'Extend to 5 neighboring villages. Develop a low-cost sensor network for real-time drainage monitoring. Explore biochar amendment to improve long-term soil structure.',
          submittedAt: new Date(),
        }
      });
    }

    // ── University B: Jharkhand Tech University ──
    const assignment2 = await prisma.universityAssignment.upsert({
      where: { challengeId_universityId: { challengeId: challenge1.id, universityId: uniTechUniversity!.id } },
      update: { status: 'ACCEPTED' },
      create: {
        challengeId: challenge1.id,
        universityId: uniTechUniversity!.id,
        status: 'ACCEPTED',
        matchScore: 0.78,
        matchExplanation: 'Good match: Civil engineering department with drainage engineering expertise. AI/Data Science faculty can develop predictive flood models for early warning.',
        recommendedAt: new Date(),
        assignedAt: new Date(),
      },
    });

    const workspace2 = await prisma.researchWorkspace.upsert({
      where: { assignmentId: assignment2.id },
      update: {},
      create: {
        assignmentId: assignment2.id,
        status: 'READY_FOR_SOLUTION',
        title: 'Smart Drainage Infrastructure with IoT Monitoring',
        description: 'Engineering approach combining civil infrastructure with IoT-based water level monitoring and AI-driven early warning.',
      },
    });

    await prisma.researchTeam.upsert({
      where: { workspaceId: workspace2.id },
      update: {},
      create: {
        workspaceId: workspace2.id,
        name: 'JTU Engineering & AI Team',
        facultyLeadId: uniadminUser!.id,
        members: { create: { userId: uniadminUser!.id, role: 'FACULTY_LEAD' } }
      }
    });

    const existingFinding2 = await prisma.researchFinding.findFirst({ where: { workspaceId: workspace2.id } });
    if (!existingFinding2) {
      await prisma.researchFinding.create({
        data: {
          workspaceId: workspace2.id,
          title: 'Rainfall patterns show predictable 48-hour warning window',
          description: 'Analysis of 10 years of IMD data shows that waterlogging events in the region are preceded by a characteristic 48-hour rainfall pattern that can be detected by ML models with 87% accuracy.',
          status: 'CONFIRMED',
          createdBy: uniadminUser!.id,
        }
      });
    }

    const existingSolution2 = await prisma.solution.findUnique({ where: { workspaceId: workspace2.id } });
    if (!existingSolution2) {
      await prisma.solution.create({
        data: {
          workspaceId: workspace2.id,
          assignmentId: assignment2.id,
          status: 'SUBMITTED',
          title: 'IoT-Enabled Smart Drainage with AI Early Warning',
          summary: 'A technology-first approach combining automated drainage gates with IoT water-level sensors and an AI-powered early warning system that alerts farmers 48 hours before predicted waterlogging events.',
          problemStatement: 'Waterlogging in Namkum is exacerbated by lack of early warning and manual drainage infrastructure that cannot respond to sudden rainfall events.',
          proposedApproach: 'Deploy IoT water-level sensors at 100m intervals, connect to a central AI prediction engine that processes IMD rainfall data, and install automated servo-controlled drainage gates at key water exit points.',
          methodology: 'Data-driven approach: collect historical rainfall-waterlogging correlation data, train LSTM neural network for prediction, validate with 2 monsoon seasons of IoT sensor data.',
          implementationPlan: 'Phase 1: IoT sensor deployment and data collection (2 months). Phase 2: AI model training (1 month). Phase 3: Automated gate installation (2 weeks). Phase 4: Full system integration and farmer training (2 weeks).',
          requiredResources: 'ESP32 microcontrollers (20 units), ultrasonic water-level sensors, solar panels, LoRa communication modules, central server, servo motors for gates, mobile app development.',
          expectedOutcome: '48-hour advance warning of waterlogging events with 87% accuracy. Automated drainage response reducing manual labor by 70%.',
          expectedImpact: '35% reduction in crop losses through early harvesting and preemptive drainage. SMS alerts reach 500+ farmers in the block.',
          limitations: 'Requires internet connectivity for cloud AI processing. Solar panels may need replacement every 3 years. Initial technology cost higher than traditional methods.',
          futureWork: 'Integrate with government disaster management systems. Expand sensor network across entire Ranchi district. Develop multilingual mobile app for farmer notifications.',
          submittedAt: new Date(),
        }
      });
    }

    // ── University C: Institute of Water Management ──
    const assignment3 = await prisma.universityAssignment.upsert({
      where: { challengeId_universityId: { challengeId: challenge1.id, universityId: uniWaterUniversity!.id } },
      update: { status: 'ACCEPTED' },
      create: {
        challengeId: challenge1.id,
        universityId: uniWaterUniversity!.id,
        status: 'ACCEPTED',
        matchScore: 0.82,
        matchExplanation: 'Strong match: Specialized water management institute with expertise in catchment area planning and flood mitigation. Faculty experienced in community-based water governance.',
        recommendedAt: new Date(),
        assignedAt: new Date(),
      },
    });

    const workspace3 = await prisma.researchWorkspace.upsert({
      where: { assignmentId: assignment3.id },
      update: {},
      create: {
        assignmentId: assignment3.id,
        status: 'READY_FOR_SOLUTION',
        title: 'Community-Based Watershed Management for Flood Resilience',
        description: 'Holistic water management approach focusing on upstream catchment treatment and community-driven maintenance.',
      },
    });

    await prisma.researchTeam.upsert({
      where: { workspaceId: workspace3.id },
      update: {},
      create: {
        workspaceId: workspace3.id,
        name: 'IWM Water Governance Team',
        facultyLeadId: wateradminUser!.id,
        members: { create: { userId: wateradminUser!.id, role: 'FACULTY_LEAD' } }
      }
    });

    const existingFinding3 = await prisma.researchFinding.findFirst({ where: { workspaceId: workspace3.id } });
    if (!existingFinding3) {
      await prisma.researchFinding.create({
        data: {
          workspaceId: workspace3.id,
          title: 'Upstream deforestation is the root cause',
          description: 'Field surveys reveal that 40% of upstream watershed area was deforested in the last decade, dramatically reducing natural water absorption capacity. Reforestation combined with check dams could restore 60% of original absorption.',
          status: 'CONFIRMED',
          createdBy: wateradminUser!.id,
        }
      });
    }

    const existingSolution3 = await prisma.solution.findUnique({ where: { workspaceId: workspace3.id } });
    if (!existingSolution3) {
      await prisma.solution.create({
        data: {
          workspaceId: workspace3.id,
          assignmentId: assignment3.id,
          status: 'SUBMITTED',
          title: 'Integrated Watershed Restoration & Community Water Governance',
          summary: 'A nature-based solution combining upstream watershed restoration with community-managed check dams and a village-level water governance committee for long-term sustainability.',
          problemStatement: 'Waterlogging in Namkum is primarily caused by upstream deforestation reducing natural water absorption, combined with inadequate community-level water management infrastructure.',
          proposedApproach: 'Three-pronged approach: (1) Upstream reforestation with native species, (2) Construction of gabion check dams at 5 strategic points, (3) Formation of a Village Water Committee with trained members for ongoing maintenance.',
          methodology: 'Participatory Rural Appraisal (PRA) methodology involving community mapping, seasonal analysis, and stakeholder workshops. GIS-based watershed delineation for optimal intervention placement.',
          implementationPlan: 'Phase 1: Community mobilization and PRA (3 weeks). Phase 2: Watershed survey and GIS mapping (2 weeks). Phase 3: Check dam construction (6 weeks). Phase 4: Reforestation drive (monsoon season). Phase 5: Water Committee formation and training (2 weeks).',
          requiredResources: 'Gabion wire baskets, stones (locally sourced), 5000 native saplings (sal, mahua, jamun), GIS software license, community facilitators, training materials.',
          expectedOutcome: 'Reduction of downstream water flow velocity by 45%. Restoration of 30 hectares of watershed forest cover within 3 years. Self-sustaining community water governance.',
          expectedImpact: '50% reduction in waterlogging severity within 2 monsoon seasons. Improved groundwater recharge. Additional income from forest produce. Model replicable across 200+ similar villages in Jharkhand.',
          limitations: 'Reforestation benefits take 3-5 years to fully materialize. Requires sustained community engagement. Dependent on government forest department cooperation for upstream access.',
          futureWork: 'Develop a statewide watershed restoration framework. Create digital twin of watershed for simulation. Link with MGNREGA for sustainable funding of maintenance activities.',
          submittedAt: new Date(),
        }
      });
    }
  }

  // Also set up JC-0002 as SUBMITTED with analysis for demo
  const challenge2 = await prisma.challenge.findUnique({ where: { challengeCode: 'JC-0002' } });
  if (challenge2) {
    // Create an AI analysis record for JC-0002
    const existingAnalysis = await prisma.challengeAnalysis.findFirst({ where: { challengeId: challenge2.id } });
    if (!existingAnalysis) {
      await prisma.challengeAnalysis.create({
        data: {
          challengeId: challenge2.id,
          provider: 'mock-intelligence',
          model: 'mock',
          modelVersion: '1.0',
          confidence: 0.88,
          isFallback: false,
          outputJson: {
            title: 'Village water supply contamination',
            summary: 'Drinking water supply in the village has been contaminated causing illness.',
            domain: 'Water',
            subdomain: 'Drinking Water Quality',
            problemType: 'Water contamination',
            requiredSkills: ['Water Engineering', 'Public Health', 'Environmental Science'],
            tags: ['water-contamination', 'drinking-water', 'public-health'],
            affectedPopulation: 'Village population of approximately 2,000 residents',
            confidence: 0.88,
          },
        }
      });
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
