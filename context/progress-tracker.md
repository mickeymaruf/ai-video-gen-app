# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- In progress

## Current Goal

- Fal.ai image-to-video generation (`04-fal-ai-integration.md`) wired into the
  Scene Editor via server actions with queued polling, live logs, and a 9:16
  video preview. Next: wire real project/scene data and persistence, then the
  dialog pattern / preview drawer.

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

## In Progress

- None.

## Next Up

- Persistence: PostgreSQL + Prisma models for projects / scenes / jobs and
  saving completed video URLs (storage model still "Not yet specified").
- Wire real project/scene data into the sidebar/editor; multi-image handling
  (currently only the first product image is sent to the model).

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

- Goal: generate UGC-style video ads from a product image (image-to-video).

## Session Notes

- 