# Technology Decisions

## 1. Frontend
- **Framework:** React + TypeScript + Vite. (Fast dev loop, robust typing).
- **Styling:** Tailwind CSS. (Rapid UI development without maintaining custom CSS architectures).
- **Routing:** React Router.
- **State Management:** TanStack Query (server state, polling notifications) + Zustand (client state like form progress).
- **Forms & Validation:** React Hook Form + Zod. (Shared schema with backend DTOs).
- **Data Visualization:** Recharts. (Consolidated to a single charting library to reduce bundle size).
- **Maps:** Leaflet. (Lightweight for district/village visualization).

## 2. Backend
- **Framework:** Node.js + NestJS + TypeScript. (The built-in Dependency Injection system is perfect for implementing the required AI Provider abstractions).
- **Validation:** `class-validator` / `class-transformer`.
- **API Documentation:** Swagger / OpenAPI.

## 3. Database
- **Engine:** PostgreSQL with `pgvector` extension.
- **ORM:** Prisma. (Type-safe schema, migrations, supports raw SQL for vector operations).
- *Reasoning:* A single database handles both relational workflow data and high-dimensional semantic search vectors. No need for a separate vector DB at this scale.

## 4. AI / ML
- **Speech-to-Text:** Whisper (self-hosted / `faster-whisper`) as default for reliability, with Bhashini pluggable when credentials are confirmed.
- **Intelligence:** Any structured-output capable LLM API (e.g., Gemini / OpenAI).
- **Embeddings:** A small, fast sentence-embedding model for the semantic deduplication.

## 5. Storage
- **Object Storage:** Cloudflare R2 (S3-compatible API).
- *Reasoning:* Zero egress fees, straightforward presigned URL integration.

## 6. Infrastructure
- **Containerization:** Docker + Docker Compose.
- **Deployment:** Vercel (Frontend), Render/Railway (Backend), Neon/Supabase (Postgres).

## 7. Testing
- **Unit & Integration:** Jest/Vitest.
- **E2E:** Playwright (testing the Golden Path from Citizen voice recording to Impact metrics).
