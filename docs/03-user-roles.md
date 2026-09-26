# User Roles

Based on the Project Plan, the system implements 7 primary roles, with 1 optional role.

### 1. Citizen
- **Purpose:** Reports societal challenges.
- **Permissions & Actions:** Submit voice/text challenge, edit own draft before submit, view own status, withdraw own draft.
- **Data Access:** Own challenges only, public aggregate analytics.
- **Workflow:** `DRAFT -> SUBMITTED`, `SUBMITTED -> WITHDRAWN`.

### 2. Government Admin
- **Purpose:** Validates challenges and oversees state-wide problem resolution.
- **Permissions & Actions:** Validate/reject/edit AI fields, override priority, mark/link duplicates, assign challenges to universities.
- **Data Access:** All challenges, duplicate clusters, priority scores, analytics dashboard. Read-only on projects.
- **Workflow:** `SUBMITTED -> VALIDATED/REJECTED`, `VALIDATED -> ASSIGNED`.

### 3. University Admin
- **Purpose:** Manages university participation and delegates to faculty.
- **Permissions & Actions:** Accept/decline assignments, create projects, assign faculty mentors, form student teams.
- **Data Access:** Assigned challenges (read-only), own university's faculty, students, projects, and teams.
- **Workflow:** `ASSIGNED -> ACCEPTED`, `ACCEPTED -> TEAM_FORMED`.

### 4. Faculty
- **Purpose:** Mentors student teams and ensures project quality.
- **Permissions & Actions:** Mentor teams, review/approve milestone evidence, request changes, sign off on pilot readiness.
- **Data Access:** Assigned projects, milestones, team rosters.
- **Workflow:** `PROPOSAL_SUBMITTED -> ACTIVE`, Milestone `SUBMITTED -> APPROVED/BLOCKED`.

### 5. Student
- **Purpose:** Executes the project.
- **Permissions & Actions:** Update milestone status, upload evidence, submit for review.
- **Data Access:** Own team's project and milestones.
- **Workflow:** Milestone `PENDING -> IN_PROGRESS -> SUBMITTED`.

### 6. Industry Partner
- **Purpose:** Provides mentorship, resources, and pilot support.
- **Permissions & Actions:** Browse matched projects, express interest, collaborate on approved projects.
- **Data Access:** Own interest records, discoverable project fields. Cannot see citizen PII.
- **Workflow:** `IndustryInterest: NEW -> EXPRESSED`.

### 7. Platform Admin
- **Purpose:** System configuration and maintenance.
- **Permissions & Actions:** Manage providers, feature flags, users, view full audit trail. Manual overrides (audited).
- **Data Access:** Everything.

### 8. Domain Expert (Optional)
- **Purpose:** Advisory capacity.
- **Permissions & Actions:** Provide advisory classification/opinions. Read-only on challenges.
