# Security Architecture

Security is baked into the platform from Phase 0, particularly given the sensitive nature of citizen reports and government infrastructure.

## 1. Authentication & Session Management
- **Passwords:** Hashed via bcrypt/argon2. Never logged or stored in plaintext.
- **Sessions:** JWT access tokens (15-minute TTL) and refresh tokens (7-day TTL, rotated on use, stored hashed in DB for revocation).

## 2. Authorization (RBAC)
- **Role-Based Access Control:** Enforced server-side using NestJS `@Roles()` guards. 
- **Ownership Checks (IDOR Prevention):** Every mutating route checks if the resource belongs to the caller's scope (e.g., `req.user.universityId === targetResource.universityId`). Frontend hiding is treated as UX only.

## 3. API & Infrastructure Security
- **Rate Limiting:** Protects login endpoints (5 attempts/15 min), AI generation endpoints, and general API routes using `@nestjs/throttler`.
- **CORS:** Strict origin allowlist (frontend domain only in production). No wildcards.
- **Headers:** Helmet middleware for standard HTTP security headers.
- **Secrets Management:** Environment variables only. `.env` files are never committed.

## 4. Media & File Handling
- **Presigned URLs:** Clients request short-lived (15 min) presigned PUT URLs for uploads, and (60 min) presigned GET URLs for downloads. Buckets remain completely private by default.
- **Validation:** Strict MIME type and size checks at the presign step (e.g., Images ≤10MB, Audio ≤20MB).

## 5. AI Prompt Injection & Integrity
- **Structural Separation:** Citizen input is explicitly delimited. AI output only writes to strictly typed, schema-validated DB columns. The AI has zero write access to status, permissions, or system metadata.
- **Sanitization:** Input is stored raw (to preserve history) but escaped on render.

## 6. Audit & Privacy
- **Audit Logging:** Every state transition, AI priority override, or challenge linking triggers a write to the `AuditLog` table.
- **PII:** Citizen phone numbers and precise locations are scoped to Government roles and hidden from Industry partners.
