# System Architecture

The system follows a Modular Monolith architecture. Given the timeline of a hackathon and expected scale, a microservices architecture is unnecessary and introduces operational risk (service discovery, distributed tracing).

```text
                              ┌─────────────────────────┐
                              │        Citizen /         │
                              │  Govt / Univ / Industry  │
                              │      (Browser / PWA)     │
                              └────────────┬──────────────┘
                                           │ HTTPS
                              ┌────────────▼──────────────┐
                              │   Frontend — React/Vite   │
                              │ (role-based routes/auth)  │
                              └────────────┬──────────────┘
                                           │ REST (JWT)
                              ┌────────────▼──────────────┐
                              │     Backend — NestJS      │
                              │  ┌─────────────────────┐  │
                              │  │ Auth & Users        │  │
                              │  │ Challenges & AI     │  │
                              │  │ Universities        │  │
                              │  │ Projects & Impact   │  │
                              │  │ Background Jobs     │  │
                              │  └─────────┬───────────┘  │
                              │            │              │
                              │  ┌─────────▼───────────┐  │
                              │  │  AI Providers (DI)  │  │
                              │  └─────────┬───────────┘  │
                              └────────────┼──────────────┘
                    ┌──────────────────────┼──────────────────────────┐
                    ▼                      ▼                          ▼
          ┌──────────────────┐   ┌────────────────────┐    ┌───────────────────────┐
          │ PostgreSQL +     │   │  Cloudflare R2     │    │  External AI Providers│
          │ pgvector         │   │  (S3-compatible)   │    │  (Whisper, Bhashini,  │
          │ (Prisma ORM)     │   │  Object Storage    │    │  LLM, Embeddings)     │
          └──────────────────┘   └────────────────────┘    └───────────────────────┘
```

## Key Architectural Principles
1. **Separation of Concerns:** The backend enforces strict module boundaries. The `ai/` module cannot write to privileged tables (like `Challenge.status` or `User`); it only writes to its isolated `ChallengeAnalysis` outputs.
2. **Deterministic Fallbacks:** AI features are strictly enhancements. If AI fails, rule-based deterministic pathways handle duplicate detection, university matching, and priority scoring.
3. **Database-backed Async:** Instead of introducing Redis + BullMQ for a few asynchronous tasks, a Postgres-backed `background_job` table is polled by a worker loop inside the NestJS process.
4. **Direct Media Uploads:** To keep heavy payload handling off the Node.js server, clients request presigned S3 URLs from the backend and upload audio/video directly to object storage.
