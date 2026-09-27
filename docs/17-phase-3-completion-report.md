# Phase 3 Completion Report: AI-Powered University Matching & Distribution

## 1. Overview
Phase 3 of JanConnect (SIH26043) extends the Phase 2 citizen-problem workflow by introducing an intelligent AI-powered matching engine. When a citizen submits a problem, Platform Administrators can now utilize the AI to find the most capable universities in the region. The Platform Admin can then distribute the problem to a maximum of 5 universities, who can accept or decline the assignment.

This phase strictly adhered to the constraints: no auto-assignment (AI only recommends), max 5 assignments per challenge, and completely replacing the old government-validation step.

## 2. Architecture & Components

### Database Schema Updates (Prisma)
- **Challenge Extensions**: Added `MATCHING`, `MATCHED`, `DISTRIBUTED` statuses. Added vector field `embedding` using pgvector (mapped via `ChallengeEmbedding`).
- **University Profiles**: Extended the `University` model to include `strengthDomains`, `capacity`, and relation to rich sub-entities.
- **Capabilities Models**: Created `Faculty`, `Facility`, and `UniversityProject` models to represent a university's true capability beyond basic domains.
- **Assignments**: Created `UniversityAssignment` with statuses `SENT`, `VIEWED`, `ACCEPTED`, `DECLINED` to track the distribution lifecycle.

### Matching Engine (`MatchingScorer` & `MatchingService`)
- **Deterministic Multi-Factor Scoring**:
  - `Domain Match (30%)`: Matches challenge domain with university strength domains.
  - `Faculty/Research Expertise (20%)`: Checks required skills against faculty research areas.
  - `Student/Researcher Skills (15%)`: Evaluates specific skills of the university body.
  - `Facilities/Labs (15%)`: Ensures universities have the labs/equipment needed.
  - `Previous Relevant Projects (10%)`: Checks if the university has done similar projects.
  - `Geographic Relevance (5%)`: Favors universities in the same district/state.
  - `Current Capacity (5%)`: Penalizes overloaded universities.
- **Explainability**: The system automatically generates a natural language `matchExplanation` detailing *why* the university was selected (e.g., "75% match due to 2 faculty members in Soil Science and advanced lab facilities in Ranchi.").
- **Constraint Enforcement**: `distributeAssignments` enforces a strict 5-university maximum using Prisma interactive transactions to avoid race conditions.

### Frontend Dashboards (React + Vite)
- **Platform Admin Dashboard**: `/admin/dashboard`
  - Allows the platform admin to view all SUBMITTED problems.
  - Drill down into `/admin/challenges/:id` to run "Generate AI Matches".
  - Select up to 5 recommended universities and dispatch the assignments.
- **University Dashboard**: `/university/assignments`
  - University admins can view problems distributed to them.
  - Drill down into `/university/assignments/:id` to review the problem summary, required skills, and the AI's explanation for the match.
  - Accept or Decline (with reason) the problem.

## 3. Security & RBAC
- Implemented robust `RolesGuard` decorators protecting the new endpoints.
  - `PLATFORM_ADMIN` manages distribution.
  - `UNIVERSITY_ADMIN`, `FACULTY`, `RESEARCHER`, `STUDENT` manage/view assignments.
- Re-architected frontend routing in `App.tsx` and `Login.tsx` to ensure seamless redirection to appropriate dashboards upon login without race conditions.

## 4. Verification Results
- **Backend Build & Compilation**: Success (`npm run build`). All circular dependencies and module import issues from scaffolding were resolved by accurately providing `DatabaseModule`.
- **Database Seeding**: Success (`npm run seed`). Seed data successfully populates 5 realistic universities (Tech, Agriculture, Water, etc.) to properly test the Matching Engine.
- **Unit & Integration Testing (Jest)**: Success (`npm run test`).
  - `MatchingService` verified to correctly process AI matches.
  - Max-5 strict transactional constraint verified to successfully throw exceptions when breached.
- **Frontend Build**: Success (`npm run build`).

## 5. Next Steps
The project is now fully prepared for Phase 4: Collaborative Research Workspace & Solution Development, where accepted university assignments will transition into active research projects allowing faculty and students to upload research notes, datasets, and proposed solutions.
