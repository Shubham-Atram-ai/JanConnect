# Requirements

## Functional Requirements
`PDF REQUIREMENT`
- **Voice/Text Intake:** Citizens must be able to submit challenges using voice or text.
- **Multilingual Support:** Support for Hindi, English, and tribal languages (Santali, Mundari, etc.).
- **AI Extraction & Auto-fill:** AI must transcribe, translate, and extract structured fields (domain, skills, priority) into an editable form.
- **Government Validation Queue:** Government admins must review, edit, and approve challenges.
- **Duplicate Detection:** The system must suggest potential duplicate challenges based on semantic similarity, location, and domain.
- **Priority Scoring:** The system must compute a deterministic priority score based on AI signals and objective metrics.
- **University Matching:** The system must recommend universities based on domain overlap, faculty expertise, and capacity.
- **Team Formation:** University admins/faculty must be able to form student teams based on required skills.
- **Project & Milestone Tracking:** Track projects from proposal through milestones to pilot completion.
- **Industry Collaboration:** Industry partners must be able to discover projects and express interest/support.
- **Impact Tracking:** Record verified impact metrics for completed pilots.
- **Audit Logging:** Every sensitive transition and AI override must be logged.
- **Notifications:** In-app notifications for state changes and assignments.

## Non-Functional Requirements
`PDF REQUIREMENT`
- **Security:** Role-based access control (RBAC), JWT authentication, input sanitization, and strict prompt injection protection.
- **Scalability:** Modular monolith architecture that can be scaled horizontally. PostgreSQL backend.
- **Reliability:** Graceful degradation if AI providers (Bhashini/LLM) fail, falling back to deterministic rules or secondary providers (Whisper).
- **Performance:** End-to-end AI processing latency under 8 seconds. Polling-based notifications instead of WebSockets for simplicity.
- **Auditability:** Complete `AuditLog` for state transitions and overrides. Original voice and transcripts must be permanently retained.
- **Data Integrity:** Strict JSON schema validation for AI outputs before hitting the database.

`OUR TECHNICAL RECOMMENDATION`
- Use Cloudflare R2 (S3-compatible) for cost-effective media storage.
- Implement rate limiting to prevent abuse of the AI pipeline and file uploads.
