# Code Standards & Architectural Guidelines

## 1. TypeScript & Type Safety

- No `any` Policy: The use of `any` is strictly prohibited. All data structures, API responses, and component props must be explicitly typed using `interface` or `type`.
- Strict Mode: Ensure `tsconfig.json` maintains `strict: true` and `noImplicitAny: true`.
- Utility Types: Prefer `Pick`, `Omit`, and `Partial` for reusing existing models instead of duplicating types.

## 2. Next.js & Component Lifecycle

- Directives: Every file must begin with `'use client'` if it uses React hooks (e.g. `useState`, `useEffect`, `useContext`) or event handlers.
- Server Components: Files without client-side interactivity must remain Server Components for performance.
- Data Fetching: Use Server Actions or Server Components for initial data loading. Use `useEffect` only for user-triggered or dynamic client updates.

## 3. Styling & Design Tokens

- Token-Based Styling: Avoid raw Tailwind arbitrary values (e.g. `w-[123px]`).
- Design Tokens: Always use values defined in `tailwind.config.ts`. If missing, define tokens before usage.
- Consistency: Use shared UI primitives in `components/ui` for spacing, radius, typography, and layout consistency.

## 4. Project Structure

- `lib/` — Business logic, database queries, API clients, utilities.
- `components/` — Reusable UI components and feature-level UI.
- `app/` — Routes, pages, and layouts (entry layer only).
- `context/` — Global state management.

## 5. Agentic Workflow (Spec-Driven)

- Context First: Always read relevant spec files in `context/feature-specs/` before implementation.
- No Assumptions: Do not implement features without explicit specification.
- Progress Tracking: Update `progress-tracker.md` after every completed or partially completed unit.
- Verification: Ensure TypeScript checks and linting pass before marking any task complete.