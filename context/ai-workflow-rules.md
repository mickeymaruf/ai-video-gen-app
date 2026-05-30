# AI Workflow & Discipline Rules

## 1. Scope & Execution Strategy

- Unit-Based Development: Break all work into small, atomic units. Never implement multiple major features in a single cycle.
- Spec-First Requirement: Always read the relevant `.md` file in `context/feature-specs/` before writing any code.
- Strict Scope: Do not implement anything listed as "Out of Scope" in `project-overview.md`.
- No Speculation: Only implement what is explicitly defined in specs or architecture docs.

## 2. Iterative Development Cycle

- Analyze: Read feature spec and validate dependencies against `architecture.md`.
- Plan: Provide a clear, minimal step-by-step implementation plan before coding.
- Execute: Implement code strictly following `code-standards.md`.
- Verify: Validate implementation against the feature spec completion checklist.

## 3. Decision-Making Protocol

- Ambiguity: Stop immediately if requirements are unclear. Ask for clarification before proceeding.
- No Assumptions: Never infer behavior, patterns, or edge cases not defined in specs.
- Breaking Changes: If changes affect existing system behavior, pause and request approval before proceeding.
- Consistency First: Always prioritize alignment with existing architecture over local optimization.

## 4. Maintenance & Syncing

- Progress Tracking: Every completed unit must update `progress-tracker.md`.
- Commit Discipline: Every commit must reference the related feature-spec file.
- Review Requirement: All generated code must pass review before merge.
- Documentation Sync: Any behavioral or structural change must be reflected in the relevant `.md` context files immediately.