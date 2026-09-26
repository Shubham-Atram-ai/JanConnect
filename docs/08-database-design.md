# Database Design

The database uses PostgreSQL with Prisma ORM.

## 1. Identity & Organizations
- **`User`**: Core authentication record (email, password_hash, role, preferred_language).
- **`Organization`**: Super-entity for Universities, Government Depts, Industries.
- **`University`**, **`UniversityDept`**, **`Faculty`**, **`Student`**: University directory and capabilities (research areas, skills, capacity limits).
- **`IndustryPartner`**: Corporate profiles (capabilities, tags, geographic focus).

## 2. Challenges & AI
- **`Challenge`**: The core ticket. Tracks status, priority, manual edits, and original audio/text references.
- **`ChallengeMedia`**: Uploaded evidence (images, video).
- **`ChallengeAnalysis`**: The raw AI extraction output (JSON, confidence score).
- **`ChallengeEmbedding`**: Contains the `vector(384)` column for semantic deduplication.
- **`ChallengeCluster`**: Links multiple duplicate challenges together without destroying their individual histories.
- **`ChallengeStatusHistory`**: Audit trail of every state change on a challenge.

## 3. Workflow & Matching
- **`ChallengeAssignment`**: The proposed or accepted link between a Challenge and a University.
- **`Team`**, **`TeamMember`**: The assigned students for an accepted challenge.
- **`Project`**: The executed solution. Has a status independent of the Challenge (e.g., `APPROVED`, `ACTIVE`, `PILOT`).
- **`ProjectProposal`**: The technical approach drafted by the team.
- **`Milestone`**, **`MilestoneEvidence`**: Granular tracking of project progression.

## 4. Industry & Impact
- **`IndustryInterest`**: Tracking when an Industry Partner expresses intent to support a project.
- **`ImpactRecord`**: Final metrics (must specify `ESTIMATED`, `MEASURED`, or `VERIFIED`).

## 5. System
- **`Notification`**: Database-backed alerts for users.
- **`AuditLog`**: Immutable ledger of sensitive actions (e.g., overriding AI priority, manually merging challenges).
- **`BackgroundJob`**: Lightweight job queue for processing embeddings, sending emails, etc.
