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
- Node.js 20+
- Docker & Docker Compose
- NestJS CLI (`npm install -g @nestjs/cli`)

### 1. Clone the repository
```bash
git clone <repo-url>
cd IgniteHub
```

### 2. Configure environment variables
```bash
cp API/.env.example API/.env
# Edit API/.env with your values
```

### 3. Start the backend + database
```bash
docker compose up -d
```

### 4. Start the frontend
```bash
cd UI
npm install
npm run dev
```

The UI will be available at `http://localhost:3000` and the API at `http://localhost:3001`.

## Core Modules

- **User Management** — Role-based registration (Student, Mentor, Admin)
- **Matching Engine** — AI-driven Student↔Mentor and Student↔Collaborator pairing
- **Innovation Workspace** — Kanban-style project tracking boards
- **Resource Repository** — Searchable library of templates, workshops, and past inventions
- **Mentorship Sessions** — Google Calendar-integrated scheduling with email alerts

## Development

- API docs (Swagger): `http://localhost:3001/api`
- Sprints follow 2-week Agile/Scrum cycles
- See `ignitehub_dev_plan.md` for the full roadmap


## License

MIT
