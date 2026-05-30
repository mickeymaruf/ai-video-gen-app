# Architecture Context

## Stack

| Layer            | Technology               | Role                                                   |
| ---------------- | ------------------------ | ------------------------------------------------------ |
| Framework        | Next.js 16 + TypeScript  | Frontend application, API routes, server actions       |
| UI               | Tailwind CSS + shadcn/ui | Application UI and component system                    |
| Auth             | (Not yet specified)      | User authentication and session management             |
| Database         | PostgreSQL + Prisma      | Store users, projects, scenes, jobs, and metadata      |
| Storage          | (Not yet specified)      | Store uploaded images and generated videos             |
| AI Generation    | Fal.ai                   | Video generation provider and model orchestration      |
| Jobs             | Polling                  | Background processing and long-running generation jobs |
| Deployment       | Vercel                   | Application hosting and deployment                     |

---

## System Boundaries

**src/** — Root source directory that contains all application code (everything below lives inside this folder)

* **app/** — Routes, pages, layouts, and server actions
* **components/** — Reusable UI components and application-specific widgets
* **lib/** — Shared utilities, Fal.ai client, database client, helpers
* **server/** — Business logic, services, job orchestration, and domain operations
* **prisma/** — Database schema and migrations
* **storage/** — File upload and storage abstractions
* **types/** — Shared TypeScript types and contracts

## Storage Model

* **PostgreSQL**: Users, projects, scenes, ownership, settings, and video metadata

## Auth and Access Model

* Every project has a single owner
* Every scene belongs to exactly one project
* Only the project owner can create, update, delete, generate, or export project resources
* All API requests validate ownership before performing mutations

## Invariants

1. Request handlers never perform long-running video generation directly; all generation runs through background jobs / polling
2. Every scene belongs to exactly one project
5. Users cannot access projects they do not own
6. Exports can only include successfully generated scenes
7. Failed generations never overwrite previous successful outputs
8. Fal.ai interactions are isolated behind a single service layer
