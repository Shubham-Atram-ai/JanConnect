# API Architecture

The backend will expose RESTful endpoints, secured via JWT. NestJS Controllers will route these appropriately.

## Domain 1: Authentication & Users
- `POST /api/v1/auth/login`: Authenticate and receive JWT.
- `POST /api/v1/auth/refresh`: Rotate refresh token.
- `GET /api/v1/users/me`: Get current user profile.

## Domain 2: Challenges & Intake
- `POST /api/v1/challenges`: Create draft challenge.
- `POST /api/v1/challenges/:id/media/presign`: Request S3 URL for evidence/audio upload.
- `POST /api/v1/challenges/:id/voice`: Trigger ASR on uploaded audio.
- `POST /api/v1/challenges/:id/analyze`: Trigger LLM intelligence extraction.
- `PUT /api/v1/challenges/:id`: Citizen edits/confirms AI form.
- `POST /api/v1/challenges/:id/submit`: Final submission.

## Domain 3: Government Validation
- `GET /api/v1/government/queue`: Fetch challenges pending validation.
- `GET /api/v1/government/challenges/:id/duplicates`: Get deterministic/semantic duplicate candidates.
- `POST /api/v1/government/challenges/:id/cluster`: Link a challenge to an existing cluster.
- `GET /api/v1/government/challenges/:id/matching`: Get ranked university suggestions.
- `POST /api/v1/government/challenges/:id/assign`: Assign challenge to a university.

## Domain 4: Universities & Teams
- `GET /api/v1/universities/assignments`: University inbox.
- `POST /api/v1/universities/assignments/:id/accept`: Accept assignment.
- `POST /api/v1/projects`: Create project from accepted challenge.
- `POST /api/v1/projects/:id/team`: Form team (add faculty, students).
- `POST /api/v1/projects/:id/proposal`: Submit technical proposal.

## Domain 5: Execution & Milestones
- `POST /api/v1/projects/:id/milestones`: Create milestone.
- `PUT /api/v1/projects/:id/milestones/:mId/submit`: Student submits evidence.
- `POST /api/v1/projects/:id/milestones/:mId/review`: Faculty approves or blocks.

## Domain 6: Industry & Impact
- `GET /api/v1/industry/discover`: Browse active/approved projects.
- `POST /api/v1/projects/:id/interest`: Express industry interest.
- `POST /api/v1/projects/:id/impact`: Record measured impact.
