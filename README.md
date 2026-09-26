# Janconnect (SIH26043)

**SIH Problem Statement ID:** SIH26043
**Problem Statement Title:** Multilingual Voice-First Societal Challenge & Innovation Collaboration Platform
**Organization:** Government of Jharkhand (Department of Higher & Technical Education)
**Theme:** Smart Education
**Category:** Software

## Project Objective
To provide a structured, accessible, multilingual channel for citizens to report local societal problems using their voice. The platform uses assistive AI to structure these problems into trackable challenges, routing them through government validation, and matching them with capable university teams and industry partners for resolution and impact tracking.

## Key Capabilities
- **Multilingual Voice Intake:** Citizens can report issues natively in Hindi, English, and tribal languages.
- **AI-Assisted Structuring:** Automatic transcription, translation, and extraction of problem domains, skills, and priority.
- **Deterministic Routing:** Automated duplicate detection and university matching based on capability.
- **Project Lifecycle:** Complete tracking from team formation to milestone completion.
- **Industry Collaboration:** Connects verified projects with industry mentors and funding.

## Architecture Overview
The platform follows a **Modular Monolith** architecture to minimize operational complexity while maintaining clean domain boundaries. 
It integrates with external AI providers for Speech-to-Text and Intelligence, falling back to deterministic rules if providers fail.

## Technology Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Zustand, TanStack Query
- **Backend:** Node.js, NestJS, TypeScript, JWT Auth
- **Database:** PostgreSQL + Prisma ORM + pgvector
- **AI/ML:** Whisper (Speech), LLM APIs (Extraction), Sentence Embeddings (Deduplication)
- **Storage:** Cloudflare R2 (S3-Compatible)
- **Infrastructure:** Docker, Docker Compose

## Repository Structure
```text
Janconnect/
├── frontend/          # (PLANNED) React application
├── backend/           # (PLANNED) NestJS application
├── prisma/            # (PLANNED) Database schema & migrations
├── docker/            # (PLANNED) Container configurations
├── docs/              # (IMPLEMENTED) Architecture & Planning documentation
├── tests/             # (PLANNED) Test suites
├── .env.example       # (PLANNED) Environment variables template
├── .gitignore         # (IMPLEMENTED)
├── docker-compose.yml # (PLANNED)
└── README.md          # (IMPLEMENTED)
```

## Development Phases
- **Phase 0:** Discovery & System Architecture `[COMPLETED]`
- **Phase 1:** Foundation (Auth, DB, Base UI) `[PLANNED]`
- **Phase 2:** Citizen Intake & Mock AI `[PLANNED]`
- **Phase 3:** Government Validation & Matching `[PLANNED]`
- **Phase 4:** University Ecosystem & Projects `[PLANNED]`
- **Phase 5:** Real AI Swap & External Collaboration `[PLANNED]`
- **Phase 6:** Hardening, Security, E2E `[PLANNED]`

## Current Status
Phase 0 Complete. Awaiting approval to begin Phase 1.

## Team
*[Placeholder for Team Information]*

## Setup Instructions
*[Placeholder for Local Development Setup Instructions]*
