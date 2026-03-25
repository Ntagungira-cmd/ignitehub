# IgniteHub 🚀

> A centralized digital ecosystem designed to transition student ideas from *sparks* to *tangible solutions*.

## Overview

IgniteHub bridges the gap between theoretical learning and real-world application for aspiring student innovators in Africa. It provides structured mentorship, AI-powered project matching, and collaborative project workspaces.

## Monorepo Structure

```
IgniteHub/
├── UI/               # Next.js 14 Frontend (App Router)
├── API/              # NestJS Backend REST API
├── docker-compose.yml
└── README.md
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | NestJS, TypeScript |
| Database | PostgreSQL 16 |
| ORM | TypeORM |
| Auth | JWT + Passport.js |
| Containerization | Docker + Docker Compose |

## Getting Started

### Prerequisites
- **Node.js**: v20 or later
- **Docker & Docker Compose**: For database and API services
- **npm**: v10 or later

### 1. Initial Setup
Clone the repository and install UI dependencies:
```bash
git clone <repo-url>
cd IgniteHub
cd UI && npm install && cd ..
```

### 2. Configure API Environment
The backend requires an `.env` file. A template is provided:
```bash
cp API/.env.example API/.env
# Update API/.env with your Google OAuth credentials if testing calendar features
```

### 3. Start Backend Services (Docker)
This will spin up the PostgreSQL database and the NestJS API:
```bash
docker compose up --build -d
```
The API will be available at `http://localhost:3001/api`.

### 4. Seed the Database (Required for Test Data)
Populate the database with realistic users, projects, and Kanban boards:
```bash
docker compose exec api npm run seed
```

### 5. Start the Frontend
In a new terminal, run the development server:
```bash
cd UI
npm run dev
```
The UI will be available at `http://localhost:3000`.

## Test Credentials
The database seeder (`npm run seed`) creates the following accounts (password: `Password123!`):

| Role | Email | Name |
|---|---|---|
| **Student** | `ntagungiraali@gmail.com` | Ali Ntagungira |
| **Mentor** | `a.ntagungira@irembo.com` | Ali Mentor |
| **Admin** | `r.ntagungir@alustudent.com` | Ali Admin |

## Core Modules

- **User Management** — Role-based accounts (Student, Mentor, Admin)
- **Matching Engine** — Project-specific connectivity (Mentor vs. Collaborator)
- **Innovation Workspace** — Kanban-style boards with per-project tracking
- **Mentorship Sessions** — Google Calendar & Meet integration for scheduling
- **Resource Repository** — Shared templates and workshop materials

## Development

- **API Documentation**: `http://localhost:3001/api`
- **Database Logs**: `docker compose logs -f db`
- **Rebuilding API**: `docker compose up --build -d api`

## License

MIT
