# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- In progress

## Current Goal

- Projects/scenes persisted in Postgres and driving the editor: create projects
  and scenes, navigate via `/editor/[projectId]?scene=`, and resume Fal.ai jobs
  after a refresh from the stored per-scene status. Next: multi-image support,
  project/scene management (rename/delete/reorder), and export.

## Completed

- Basic AI video generation pipeline (Fal.ai) with job polling — see
  Session Notes below.
- `01-design-system.md` — shadcn/ui design system installed and configured
  (`base-nova` style, `neutral` base color, base-ui primitives). Added
  Button, Card, Dialog, Dropdown Menu, Input, Tabs, Textarea to
  `src/components/ui/`. Added `lucide-react`. `cn()` helper at
  `src/lib/utils.ts`. `tsc --noEmit` clean for all UI components.
  Generated `components/ui/*` files left unmodified.
- `02.editor.md` — editor shell UI built pixel-to-screenshot. Added
  `src/components/editor/editor-navbar.tsx` (brand switcher cell width-matched
  to the sidebar, project title, $1.59, `fal.ai connected` status pill,
  Export action), `editor-sidebar.tsx` (New Project button, active Project #1
  with nested selectable scenes + blue tree line, Add Scene ghost button,
  secondary items), and `scene-editor.tsx` (TYPE/LANGUAGE/MODEL dropdowns,
  START/END card segmented tabs, Script + Visual Guide textareas with a SOUND
  toggle, Start Card uploader, product-image thumbs, Generate button).
  Composed in `src/app/editor/page.tsx`. Built on existing design tokens
  (blue `--primary`, `--success`, `--accent`); a few arbitrary text sizes
  (`text-[11px]`/`text-[10px]`) used for pixel-accurate labels per the
  explicit "pixel perfect" request. `tsc --noEmit` clean for the new files
  (only pre-existing `lib/worker.ts` error remains).
- Theme set to **light mode** per updated `context/ui-context.md`
  (light SaaS workspace: gray page, white surfaces, blue accent, green
  success). `globals.css` `:root` rewritten to light tokens with a blue
  `--primary`/`--ring` and an added `--success` token; the `.dark` block
  was removed (no dark mode). No `dark` class on `<html>` in `layout.tsx`.
- `03.upload-product-image.md` — extracted the inline Product Images upload
  from `scene-editor.tsx` into a reusable
  `src/components/editor/product-image-uploader.tsx`. Tasks:
  - [x] Installed `react-dropzone`.
  - [x] Built a controlled `ProductImageUploader`
    (`interface { images: File[]; onChange: (images: File[]) => void }`,
    no `any`) using `useDropzone` for multi-image add via drag-and-drop or
    click (`accept: { 'image/*': [] }`, `multiple: true`).
  - [x] Dashed drop zone reuses the existing `size-16` upload-tile styling
    with a blue active tint (`border-primary bg-primary/10 text-primary`)
    while dragging over.
  - [x] Selected files render as a thumbnail row, each with a hover remove
    (`X`) button; previews use `URL.createObjectURL` (derived via `useMemo`)
    and are revoked on change/unmount to avoid leaks.
  - [x] `scene-editor.tsx` lifts the image list into state
    (`useState<File[]>`) and passes it down; the inline Upload button +
    placeholder thumbnails are gone, the `FieldLabel` "Product Images"
    heading is reused, and the now-unused `X` import was removed.
  - [x] `tsc --noEmit` clean for the feature (only the pre-existing
    `lib/worker.ts` error remains); ESLint reports zero problems for the
    new/changed files. Pre-existing lint errors in unrelated Fal.ai-pipeline
    files (`app/editor-test/page.tsx`, `lib/jobStore.ts`, `lib/worker.ts`)
    were left untouched per strict scope.
- `04-fal-ai-integration.md` — Scene Editor wired to Fal.ai
  `fal-ai/minimax-video/image-to-video` through **server actions** (no API
  route handlers), per invariant #8 (single Fal.ai service layer):
  - `src/lib/fal.ts` — configures the `@fal-ai/client` singleton from
    `process.env.FAL_KEY` (server-only) and exports the `VIDEO_MODEL` id.
  - `src/server/generation/actions.ts` (`'use server'`) — `submitVideoGeneration`
    uploads the first product `File` via `fal.storage.upload`, then
    `fal.queue.submit`s `{ prompt, image_url, prompt_optimizer }` (prompt =
    Script + Visual Guide joined) and returns the `request_id`;
    `pollVideoGeneration` returns one `{ status, logs, videoUrl }` snapshot
    (`fal.queue.status` with `logs: true`, then `fal.queue.result` on COMPLETED).
  - `src/types/generation.ts` — `QueueState`, `GenerationLog`, `PollResult`,
    `MinimaxVideoOutput` (no `any`).
  - `scene-editor.tsx` — Script/Visual Guide are now controlled; **Generate**
    submits FormData (script, visualGuide, first product image) then runs a
    non-blocking poll loop (1.5s) updating live status + logs. A second Card
    below the editor shows the status pill, a scrollable mono log panel, errors,
    and the finished `<video>` (autoplay/loop, 9:16). Existing editor layout
    untouched.
  - 9:16 enforced at the render layer (`--aspect-portrait: 9 / 16` token +
    `object-contain`) since this model derives ratio from the input image and
    exposes no aspect/resolution param — see Architecture Decisions.
  - `tsc --noEmit` and `eslint` both clean for all new/changed files.
- `05-projects-database.md` (schema layer) — minimal **Project → Scene** Prisma
  models so a project persists and survives refresh, including in-flight Fal.ai
  jobs. Owner/auth and `logs` intentionally deferred (see Architecture
  Decisions). Tasks:
  - [x] `prisma/schema.prisma` — `GenStatus` enum
    (`IDLE`/`SUBMITTING`/`IN_QUEUE`/`IN_PROGRESS`/`COMPLETED`/`ERROR`),
    `Project` (`id` cuid, `title`, timestamps, `scenes Scene[]`), and `Scene`
    (`projectId` + cascade relation, `order`, editor inputs `script`/
    `visualGuide`/`imageUrl`, Fal.ai job state `requestId`/`status`/`videoUrl`/
    `error`, timestamps, `@@index([projectId])`).
  - [x] `src/lib/prisma.ts` — dev-safe `globalThis` client singleton using the
    `@prisma/adapter-pg` driver adapter with `DATABASE_URL`; imports the
    generated client from `app/generated/prisma/client`.
  - [x] Migration `20260530135702_init_project_scene` applied to the pooled
    Postgres DB; client generated to `app/generated/prisma`. Verified with a
    throwaway smoke test (create Project + nested Scene, read back via relation,
    `status` defaults to `IDLE`, cascade delete) — since removed.

- `05-projects-database.md` (app wiring) — projects/scenes persisted and driving
  the editor. Generator output moved to `../generated/prisma`
  (import in `src/lib/prisma.ts`); editor `GenStatus` union converged on the
  uppercase DB enum (`src/types/generation.ts`). Tasks:
  - [x] `src/server/projects/actions.ts` — `createProject` (seeds one empty
    scene) and `createScene`; both `revalidatePath` then the client navigates.
  - [x] `src/server/generation/actions.ts` rewritten to be scene-aware:
    `submitVideoGeneration(sceneId, formData)` persists inputs + `requestId` +
    `IN_QUEUE` (reusing `imageUrl` when no new file is sent), and **forks a new
    scene** instead of overwriting one that already ran;
    `pollVideoGeneration(sceneId, requestId)` persists each status transition and
    the final `videoUrl`. Logs stay transient. (Error persistence later moved to
    the webhook — see the webhook entry below.)
  - [x] Routes: `/editor/[projectId]/page.tsx` (RSC: loads projects + active
    project's scenes, active scene from `?scene=`) and `/editor/page.tsx`
    (`force-dynamic`; redirects to latest project or shows the empty state).
  - [x] `editor-sidebar.tsx` data-driven (projects + scene tree as `Link`s, New
    Project / Add Scene via actions, per-scene status indicator);
    `editor-navbar.tsx` takes a `title`; `scene-editor.tsx` controlled from the
    persisted scene, keyed by id, resumes polling on mount when a job is still
    running, and shows the persisted `imageUrl`.
  - [x] `Type` / `Language` / `Model` left as static UI (not persisted) per
    request. `tsc --noEmit`, `eslint`, and `next build` all clean; verified at
    runtime (`/editor` 200/307 redirect, unknown id 404, project page renders).
- Durable generation sync via **Fal.ai webhooks** — fixes results being lost when
  the user leaves the page (the browser poll loop was the only thing writing the
  job result) and scenes getting permanently stuck `ERROR` on a transient client
  hiccup. fal now pushes the terminal state to the server. Tasks:
  - [x] `prisma/schema.prisma` — `@@index([requestId])` on `Scene` for webhook
    lookups (migration `20260530154913_scene_request_id_index`).
  - [x] `src/lib/fal-webhook.ts` — ED25519 signature verification using fal's
    JWKS (`https://rest.fal.ai/.well-known/jwks.json`, cached 24h) via Node
    `crypto` (no new dependency); checks the ±300s timestamp window and the
    `reqId\nuserId\nts\nsha256(body)` signed message from the `X-Fal-Webhook-*`
    headers.
  - [x] `src/app/api/fal/webhook/route.ts` (`runtime = "nodejs"`) — verifies,
    finds the scene by `request_id`, and writes `COMPLETED` + `videoUrl` (status
    `OK` w/ payload) or `ERROR` + message (`error`/`payload_error`); idempotent,
    `revalidatePath`s the project. Unsigned/forged/`GET` → 401/401/405 (verified).
  - [x] `submitVideoGeneration` passes `webhookUrl` derived from `APP_URL`
    (omitted when unset → graceful client-poll fallback).
  - [x] `scene-editor.tsx` — the client poll loop is now non-authoritative: a
    transient poll error no longer calls `failScene` (removed); it leaves the
    scene non-terminal and shows a soft "connection lost — refresh to check"
    notice. Webhook + resume-on-mount reconcile the real result.
  - [x] `.env` — documented `APP_URL` (prod origin / local tunnel). Local parity
    needs a tunnel (cloudflared/ngrok); end-to-end webhook delivery is verifiable
    only with a public URL.

## In Progress

- None.

## Completed (continued)

- `10-model-config.md` — Type / Language / Model are now real, and Sound +
  Start/End cards feed generation per the selected model's capabilities. Tasks:
  - [x] `src/lib/video-models.ts` — curated registry of top fal.ai image-to-video
    models (MiniMax Video [default], Google Veo 3.1, Kling 2.6 Pro, Seedance 1.5
    Pro, MiniMax Hailuo 02). Each `VideoModel` declares its start-image param,
    end-frame param (or `null`), audio param (or `null`), prompt-optimizer flag,
    and accepted aspect ratios. Pure `buildModelInput()` emits only the params a
    model actually supports (never submits an invalid field); `getVideoModel()`
    resolves id → model with a safe default. Data + pure functions only (no fal
    client) so client components can import it (invariant #8 preserved — the fal
    queue calls stay in `server/generation/actions.ts`).
  - [x] Schema: `Scene` gains `type`/`language`/`model`/`sound`/`startImageUrl`/
    `endImageUrl` (migration `20260531045606_scene_model_config`). `SceneData`
    extended; `TYPE_OPTIONS` / `LANGUAGE_OPTIONS` added to `src/types/project.ts`.
    `MinimaxVideoOutput` renamed `VideoOutput` (shared output shape).
  - [x] `scene-editor.tsx` — Type / Language / Model dropdowns and the Sound
    toggle are controlled + persisted (keyed per scene, resume-safe). The Sound
    toggle renders only when the model has an audio param; the End Card uploader
    only when the model has an end-frame param. Start/End card files (or persisted
    URLs) are sent on generate; `CardImageUploader` now also renders a persisted
    `existingUrl`. Start-frame validation accepts a product image *or* a start card.
  - [x] `submitVideoGeneration` builds the fal input from the selected model:
    start frame = start card ?? product image, optional end frame, audio = Sound,
    aspect ratio from the project (only when accepted), and a prompt composed from
    Type (style) + Language + Script + Visual Guide. Persists all config; forks
    carry it. `pollVideoGeneration` takes the model endpoint as an argument — the
    client (which already holds it) passes it, so the hot 1.5s poll loop no longer
    issues a per-cycle DB read just to recover the model id. The id is captured by
    value into `runPoll` (resume → `scene.model`, post-submit → `modelId`) so a
    mid-run Model-dropdown change can't redirect the poll; `getVideoModel()` guards
    unknown ids. `VIDEO_MODEL` const removed from `src/lib/fal.ts`.
  - [x] `tsc --noEmit`, `eslint` (no new findings; one pre-existing unused-`logs`
    warning from the `09` layout refactor left untouched), and `next build` clean.

- `09-refine-scene-editor-layout.md` — scene editor layout refactored to match
  the reference screenshot. Tasks:
  - [x] Removed the `CardSideTabs` (start/end card tab switcher) from the header
    row and the toggled single-slot uploader from the right side of the prompts
    area.
  - [x] Created `src/components/editor/card-image-uploader.tsx` — single-image
    drag-and-drop uploader (modelled on `ProductImageUploader`) for start/end
    reference cards; accepts `image: File | null`, `onChange`, and `label`; uses
    `react-dropzone` (`multiple: false`), revokes the preview object URL on
    unmount; not wired into the generation model yet.
  - [x] Left column (`flex-1`) now stacks: Script → Visual Guide + Sound toggle
    → Product Images → Start Card | End Card (side-by-side, each `flex-1 h-24`).
  - [x] Right column (`w-52`, `aspect-portrait`) replaces the separate generation
    feedback Card: shows a 9:16 placeholder while idle, spinner + status text
    while generating, and the finished `<video>` when complete. Error/notice text
    appears below the video area; Generate button always visible; Regenerate
    button appears only when a `videoUrl` is set.
  - [x] `tsc --noEmit` and `eslint` clean for all new/changed files.

- `08-refine-project-creation.md` — project creation/settings modal. The Stitch
  screen (project `15708072907553766876`, screen
  `6d1c1207cca849aca4cac318f513b172`) was not retrievable (no Stitch tool/public
  URL in this environment), so the modal follows the spec's content + the existing
  light-SaaS design system. Tasks:
  - [x] Schema: `Project.aspectRatio String @default("9:16")` (`"9:16" | "16:9" |
    "1:1"`); migration `20260530172115_project_aspect_ratio` applied, client
    regenerated.
  - [x] `src/server/projects/actions.ts` — `createProject({ title, aspectRatio })`
    now takes a name (modal create flow); added `updateProject(projectId, { title,
    aspectRatio })` (the modal Save action, server-side ratio validation). Project
    cost intentionally skipped per spec.
  - [x] `src/components/editor/project-settings-modal.tsx` — one reusable modal:
    **create** mode (name + aspect ratio → create + navigate) and **settings** mode
    (rename + aspect ratio → save + refresh). Aspect ratio shown as a 3-up selector
    with ratio-shaped previews. Shared aspect-ratio type/options in
    `src/types/project.ts` (`ASPECT_RATIOS`, `AspectRatio`).
  - [x] `editor-sidebar.tsx` — New Project now opens the modal in create mode
    (no longer creates immediately); the per-project gear is a real button opening
    the same modal in settings mode. `ProjectSummary` carries `aspectRatio`
    (selected in `/editor/[projectId]` query).
  - [x] `loading.tsx` with a centered animated `Loader2` spinner at `/editor` and
    `/editor/[projectId]`.
  - [x] `tsc --noEmit`, `eslint`, and `next build` all clean.

## Next Up

- End-to-end webhook test with a tunnel + real fal job (set `APP_URL`, generate,
  leave the page, confirm the scene reaches `COMPLETED` from the webhook alone).
- Multi-image handling (model stores a single `imageUrl`; only the first product
  image is sent). Project rename/delete + scene delete/reorder. Export.

## Open Questions

- Storage provider for uploaded images / generated videos is still
  unspecified in `architecture.md` (currently relying on Fal.ai's ephemeral
  storage for the input image and the returned `fal.media` URL).
- Auth provider is unspecified; server actions are not yet ownership-guarded
  (invariant: "All API requests validate ownership before performing mutations").

## Architecture Decisions

- **Fal.ai isolated behind a single service layer** (invariant #8): the client
  lives in `src/lib/fal.ts` and all generation operations in
  `src/server/generation/actions.ts`. UI never talks to Fal.ai directly.
- **Generation runs via queue + client polling, not synchronous request work**
  (invariant #1): `submit` returns a `request_id` immediately; the client polls
  `status`/`result` through server actions, so no request handler blocks on the
  long-running job.
- **9:16 applied at the render layer, not the model input**: confirmed via the
  endpoint's OpenAPI schema that `fal-ai/minimax-video/image-to-video` accepts
  only `prompt`, `image_url`, `prompt_optimizer` — no aspect/resolution field.
  The hardcoded 9:16 requirement is satisfied with the `aspect-portrait` token +
  `object-contain` on the `<video>`, avoiding an invalid param that would break
  submission.
- **Minimal Project model first; owner and logs deferred**: the persistence
  schema intentionally omits any `userId`/owner field (no auth provider yet) and
  does not persist Fal.ai `logs` — logs are re-fetchable from Fal via the stored
  `Scene.requestId`, which is the single field that makes resume-after-refresh
  possible. `Project → Scene` (not one embedded table) was chosen to match the
  multi-scene model in `architecture.md` and avoid reworking the row shape when
  scene #2 lands.

- Goal: generate UGC-style video ads from a product image (image-to-video).

## Session Notes

- 