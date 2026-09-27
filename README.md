# JanConnect

A digital platform to crowdsource societal challenges and facilitate collaborative problem solving through universities and industry partnerships.

## SIH 2026

*   **Problem Statement ID:** 26043
*   **Organization:** Government of Jharkhand
*   **Department:** Department of Higher & Technical Education
*   **Category:** Software
*   **Theme:** Smart Education

## Problem

Governments and citizens often struggle to bridge the gap between identifying local societal challenges (e.g., waterlogging, failing infrastructure) and finding technical solutions. Simultaneously, universities and engineering students have the technical capacity but lack exposure to real-world, localized problems.

## Solution

JanConnect acts as a unified digital bridge. It enables citizens to easily submit local problems, optionally assisted by AI translation for vernacular languages. The platform then uses intelligent matching to assign these problems to the most relevant university departments. Universities work on solutions in dedicated workspaces and submit them back to the government for review and implementation.

## Key Features

### Citizen
*   Submit societal challenges with descriptions and location data.
*   Upload supporting evidence (images, videos).
*   Track the lifecycle of reported problems.

### University
*   Receive problem assignments based on institutional domain expertise.
*   Dedicated research workspaces to manage teams and findings.
*   Submit structured solutions with methodology, resource requirements, and expected outcomes.

### Government / Admin
*   Dashboard to monitor submitted challenges across the state.
*   Review AI-assisted problem categorization and prioritization.
*   Route problems to appropriate universities.
*   Review submitted solutions for implementation feasibility.

### Intelligence
*   AI-driven categorization and tagging of problems.
*   Automated university matching based on faculty expertise and department domains.
*   (Optional) Translation services for regional languages.

### Collaboration
*   Workspace findings and solution drafting for university teams.
*   Structured proposal submissions.

### Analytics
*   Geographic hotspot tracking for recurring issues.

## System Architecture

*   **Frontend:** React (Vite), TailwindCSS, Zustand for state management.
*   **Backend:** NestJS (Node.js) providing a modular RESTful API.
*   **Database:** PostgreSQL with `pgvector` for advanced querying, managed via Prisma ORM.
*   **AI/Intelligence:** Fallback/Mock provider for demo environments, with interfaces ready for real LLM/Bhashini integrations.

## Technology Stack

*   **Frontend:** React 19, Vite, Tailwind CSS, Zustand, React Query
*   **Backend:** NestJS, Prisma ORM, JWT Authentication
*   **Database:** PostgreSQL 16 (pgvector)
*   **Infrastructure:** Docker, Docker Compose
*   **Testing:** Jest (Backend), Playwright (E2E)

## Prerequisites

*   Git
*   Docker and Docker Compose
*   Node.js 20+ (if running locally without Docker)

## ⚡ Evaluator Quick Start

### 1. Clone
```bash
git clone <repo-url>
```

### 2. Enter directory
```bash
cd Janconnect
```

### 3. Configure environment
```bash
cp .env.example .env
```

### 4. Start application
```bash
docker-compose up --build
```
*(Note: On newer Docker installations, use `docker compose up --build`)*

### 5. Open
*   **Frontend:** http://localhost:3000
*   **Backend API Base:** http://localhost:8000/api/v1
*   **Health Check:** http://localhost:8000/api/v1/health

## Environment Variables

All required variables are present in `.env.example`.
*   `DATABASE_URL`: PostgreSQL connection string.
*   `PORT`: Backend port (default 8000).
*   `FRONTEND_URL`: URL of the frontend (for CORS).
*   `VITE_API_URL`: URL of the backend API for the frontend.
*   `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`: Secrets for authentication.

Optional integrations (like external AI or Translation) can be added, but the core platform works flawlessly using robust mock providers if omitted.

## Database Setup

When using the Evaluator Quick Start, Docker Compose automatically:
1. Provisions the PostgreSQL database.
2. Runs Prisma migrations (`npx prisma migrate deploy`).
3. Seeds the database with demo accounts and data (`npx tsx scripts/seed.ts`).

If running manually without Docker, execute:
```bash
npx prisma migrate deploy
npm run seed
```

## Demo Accounts

The following accounts are automatically created during the seed process.

**Password for all demo accounts:** `password123`

| Role | Email | Purpose |
| :--- | :--- | :--- |
| **Citizen** | `citizen@example.com` | Submitting new problems |
| **Government Admin** | `govadmin@example.com` | Reviewing problems & routing to universities |
| **University Admin** | `uniadmin@example.com` | Accepting assignments & submitting solutions |
| **Platform Admin** | `platformadmin@example.com` | System oversight |

## Demo Workflow

1.  **Login as Citizen** (`citizen@example.com`). Submit a new societal problem (e.g., damaged village road).
2.  **Login as Government/Admin** (`govadmin@example.com`). Navigate to the admin dashboard, review the newly submitted problem, observe its categorization, and assign it to a university.
3.  **Login as University** (`uniadmin@example.com`). View the incoming assignment, accept it, and open the research workspace. Create a solution proposal and submit it.
4.  **Login as Government/Admin** (`govadmin@example.com`). Review the submitted solution and track its lifecycle.

## API

The backend exposes a REST API prefixed with `/api/v1`. Core modules include Auth, Users, Challenges, University, and Admin.

## Testing

**Backend Unit Tests:**
```bash
cd backend
npm run test
```

## E2E Testing

We use Playwright for robust End-to-End testing.
```bash
cd frontend
npx playwright test
```

## Security

*   Passwords are securely hashed using `bcrypt`.
*   Authentication is stateless using JWT (Access & Refresh tokens).
*   CORS is restricted to configured frontend origins.
*   No sensitive secrets or API keys are committed to the repository.

## Troubleshooting

*   **Port already in use:** Ensure ports 3000 (Frontend), 8000 (Backend), and 5432 (PostgreSQL) are free. Modify `.env` and `docker-compose.yml` if you need to remap ports.
*   **Database migration failure:** If the database container is restarted without volumes, you may need to clear the volume: `docker compose down -v` and restart.
*   **Frontend cannot reach backend:** Ensure `VITE_API_URL` in `.env` matches the backend host and port.
*   **Windows/Linux differences:** Docker Compose abstracts away most OS differences, but ensure scripts have LF line endings if executed directly.

## Future Scope

*   Integration with live external LLMs (Bhashini for regional languages, Gemini for deep intelligence analysis).
*   Live object storage (S3) for media uploads.
*   SMS and Push notification integrations for citizens in remote areas.

## License

This project is unlicensed for the purpose of the Smart India Hackathon.
