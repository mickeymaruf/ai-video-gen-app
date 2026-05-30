# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- In progress

## Current Goal

- Editor shell (`02.editor.md`) built and the Product Images input
  (`03.upload-product-image.md`) extracted into a reusable dropzone. Next:
  wire real project/scene data and the dialog pattern / preview drawer.

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

## In Progress

- None.

## Next Up

- Build feature UI on top of the new primitives (projects / scenes / generation).

## Open Questions

- [Any unresolved product or technical decisions]

## Architecture Decisions

- [Decisions made that affect the system design or
  data model — include why the decision was made]

- Goal: generate UGC-style video ads from a product image (image-to-video).

## Session Notes

- 