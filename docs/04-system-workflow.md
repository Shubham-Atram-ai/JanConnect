# System Workflow

The end-to-end lifecycle of a societal challenge involves two major state machines: the Challenge State Machine and the Project State Machine.

## 1. Challenge Intake & Validation (Challenge State Machine)
- **Draft (`DRAFT`):** Citizen speaks/types the problem. AI transcribes, translates, and extracts structured data. Citizen reviews the editable form.
- **Submission (`SUBMITTED`):** Citizen submits the challenge. Priority engine computes initial score.
- **Validation (`UNDER_REVIEW` -> `VALIDATED` | `REJECTED`):** Government Admin reviews the AI fields, checks confidence badges, and checks for duplicates (linking them into clusters if appropriate). Admin approves or rejects.
- **Assignment (`VALIDATED` -> `ASSIGNED`):** Government Admin views AI-recommended universities (based on deterministic matching) and assigns the challenge to a university.

## 2. University & Team Formation
- **Acceptance (`ASSIGNED` -> `ACCEPTED` | `DECLINED`):** University Admin reviews the assignment and accepts it (or declines with a reason).
- **Team Formation (`ACCEPTED` -> `TEAM_FORMED`):** University Admin creates a project, assigns a Faculty mentor, and forms a Student team based on AI-suggested skill matches.
- **Proposal (`TEAM_FORMED` -> `PROPOSAL_SUBMITTED`):** The team writes a technical approach and timeline.

## 3. Project Execution (Project State Machine)
- **Approval (`PROPOSED` -> `APPROVED`):** Faculty mentor signs off on the proposal.
- **Active (`APPROVED` -> `ACTIVE`):** University Admin confirms the project starts.
- **Milestones (`PENDING` -> `IN_PROGRESS` -> `SUBMITTED` -> `APPROVED` | `BLOCKED`):** Students upload evidence; Faculty reviews and approves/requests changes.
- **Pilot (`ACTIVE` -> `PILOT`):** Faculty signs off on pilot readiness based on completed milestones.

## 4. Industry Collaboration (Parallel)
- **Discovery:** Industry Partner browses matched projects.
- **Expression of Interest (`NEW` -> `EXPRESSED`):** Industry Partner offers mentorship, funding, or testing facilities.
- **Collaboration:** Government/University approves the involvement.

## 5. Closure & Impact
- **Completion (`PILOT` -> `COMPLETED`):** Pilot evidence is uploaded and validated by Faculty.
- **Validation (`COMPLETED` -> `VALIDATED`):** Government Admin confirms the outcome.
- **Impact Measurement:** Impact records are finalized (must be labeled `MEASURED` or `VERIFIED`, not just `ESTIMATED`).
