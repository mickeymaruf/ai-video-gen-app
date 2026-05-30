Implement the Prisma schema, dev-safe database client, and migration strategy for the editor workflow.

## Prisma Schema (`prisma/schema.prisma`)
Define the models matching these exact specifications:

### Project
- `id`: String (`cuid`), primary key (acts as the URL anchor).
- `title`: String.
- `createdAt` / `updatedAt`: Timestamps.
- `scenes`: Relation to `Scene[]` with cascade delete.

### Scene
- `id`: String (`cuid`), primary key.
- `projectId`: String, foreign key.
- `order`: Int (for sequence positioning).
- **Editor Inputs:** `script` (String), `visualGuide` (String), `imageUrl` (String?).
- **Fal.ai State (Survives Refresh):**
  - `requestId`: String? (The Fal queue ID used to resume/re-poll live logs on reload).
  - `status`: Enum (`IDLE`, `SUBMITTING`, `PROCESSING`, `SUCCESS`, `ERROR`) @default(IDLE).
  - `videoUrl`: String?
  - `error`: String?

---

## 2. Integration Constraints & Boundaries

- **Authentication:** Omit `userId` or owner fields for now. Design `Project` so that an `ownerId` can be cleanly appended later.