# Module Architecture

The system is organized into a modular monolith with strict boundary rules. Each module encapsulates its own business logic and database entities.

## 1. Core / Common Module
- **Purpose:** Cross-cutting concerns, security, logging.
- **Features:** Authentication (JWT), RBAC Guards, Audit Log interceptor, generic exceptions, Background Job worker.

## 2. AI Abstraction Layer
- **Purpose:** Interface to external AI models with deterministic fallbacks.
- **Dependencies:** Whisper, Bhashini, LLM API, Embedding API.
- **Features:** 
  - `SpeechProvider` (Audio to Transcript)
  - `TranslationProvider` (Language translation)
  - `IntelligenceProvider` (LLM-based structured extraction)
  - `EmbeddingProvider` (Text to Vector)

## 3. Challenge Module (Citizen & Govt)
- **Purpose:** Intake, validation, and lifecycle of a Challenge.
- **Features:** Voice recording, Media upload (R2 presigned URLs), AI form pre-fill, duplicate detection, priority scoring, validation queue.
- **Entities:** `Challenge`, `ChallengeMedia`, `ChallengeAnalysis`, `ChallengeEmbedding`, `ChallengeCluster`.

## 4. Matching & Routing Module
- **Purpose:** Connect challenges to the right universities and faculty.
- **Features:** Deterministic matching (domain overlap, geography, capacity), Faculty matching, Student skill matching.
- **Entities:** `ChallengeAssignment`.

## 5. University Ecosystem Module
- **Purpose:** Manage institutions, faculty, and students.
- **Features:** University dashboard, directories, capacity tracking.
- **Entities:** `University`, `Faculty`, `Student`.

## 6. Project & Milestone Module
- **Purpose:** Execution tracking.
- **Features:** Proposal drafting, team assignment, milestone CRUD, evidence review, status transitions.
- **Entities:** `Team`, `TeamMember`, `Project`, `Milestone`, `MilestoneEvidence`.

## 7. Industry & Impact Module
- **Purpose:** External collaboration and outcome measurement.
- **Features:** Industry profile matching, interest expression, impact recording.
- **Entities:** `IndustryPartner`, `IndustryInterest`, `ImpactRecord`.

## 8. Analytics & Notifications
- **Purpose:** Dashboarding and user alerts.
- **Features:** Database-backed polling notifications, Recharts data aggregation.
- **Entities:** `Notification`, (Aggregate queries for dashboards).
