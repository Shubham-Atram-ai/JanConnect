# Testing Strategy

The project employs a multi-layered testing approach to ensure stability and correctness, particularly for the matching algorithms and AI workflows.

## 1. Unit Testing
- **Focus:** Deterministic algorithms and state transitions.
- **Targets:**
  - Priority scoring engine (weights, boundaries, overrides).
  - Duplicate scoring engine.
  - University/Faculty matching scoring.
  - RBAC guard logic (role x ownership matrix).
  - AI JSON output schema validation (Zod/class-validator).

## 2. Integration Testing
- **Focus:** API boundaries and database operations.
- **Targets:**
  - Auth flows (login, refresh, expiry).
  - Full Challenge creation to submission (bypassing real AI with Mock Providers).
  - Milestone and evidence upload flows.
  - Verification that the `AuditLog` interceptor correctly catches and writes events.

## 3. End-to-End (E2E) Testing
- **Focus:** The Golden Path.
- **Framework:** Playwright.
- **Scenario:** 
  Citizen login -> Voice submission (Mock) -> Government validate -> University accept -> Team form -> Proposal submit -> Milestone approve -> Industry interest -> Impact record.
- *Rule:* The E2E suite must pass on the deployed build before any demo.

## 4. AI Evaluation (Fixture-based)
- **Focus:** The structured output and classification reliability.
- **Methodology:** A static set of input fixtures covering Hindi, English, Hinglish, typo-heavy text, and ambiguous problems.
- **Execution:** Runs deterministically against `MockIntelligenceProvider` in CI to verify the fallback and confidence band logic. Run manually against the live LLM Provider before major releases to spot-check quality.
