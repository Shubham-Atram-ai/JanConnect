# Development Roadmap

Following the Master Implementation Plan, the roadmap is divided into iterative weeks.

## Week 1: Foundation
- **Goals:** Monorepo setup, Docker configuration, Database Schema + Migrations, Auth/RBAC, and generic UI shell.
- **Deliverables:** `auth/`, `users/`, `common/` guards, base React application with routing.

## Week 2: Citizen Intake & Mock AI
- **Goals:** Voice recording UI, media upload presigning, Mock AI providers wired end-to-end.
- **Deliverables:** A citizen can speak, see a pre-filled form, edit it, and submit.

## Week 3: Government & Deterministic Matching
- **Goals:** Validation queue, deterministic priority engine, deterministic duplicate detection, and university scoring.
- **Deliverables:** Government can validate, assign challenges, and link duplicates safely.

## Week 4: University Ecosystem & Projects
- **Goals:** University dashboards, team formation UX, project state machine, milestones.
- **Deliverables:** Challenges transition from assigned to active projects with student teams.

## Week 5: Real AI Swap & External Collaboration
- **Goals:** Swap Mock providers for Real providers (Whisper/LLM/Bhashini), Industry matching, Impact records, Analytics.
- **Deliverables:** Fully functioning AI pipeline, dashboard charts, industry interest flows.

## Week 6: Hardening & E2E
- **Goals:** Security review, Golden path E2E tests, robust seed data, and deployment.
- **Deliverables:** Deployable application ready for demonstration.
