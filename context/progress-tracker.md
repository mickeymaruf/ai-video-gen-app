# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- [e.g. Not started / In progress / Complete]

## Current Goal

- [What you are building right now]

## Completed

- None yet.

## In Progress

- None yet.

## Next Up

- [First unit to build]

## Open Questions

- [Any unresolved product or technical decisions]

## Architecture Decisions

- [Decisions made that affect the system design or
  data model — include why the decision was made]

- Goal: generate UGC-style video ads from a product image (image-to-video).

## Session Notes

- `src/app/api/generate/route.ts` wired to `fal-ai/ltx-video/image-to-video`
  — fal.ai's cheapest image-to-video model (~$0.02 per 5s clip), chosen for
  low-cost UGC testing. Flow: upload product image to fal storage
  (`fal.storage.upload`) → get `image_url` → `fal.subscribe(...)` with a
  motion `prompt` → output `result.data.video.url`.
- Job result now stores `video` (was `image`). `page.tsx` renders a
  `<video>` (autoplay/loop/muted) + download link instead of an `<img>`.
- The prompt should describe MOTION/camera, not the static scene.
- Requires `FAL_KEY` in env. Workflow: page.tsx → POST /api/generate →
  jobId → poll /api/generate-status → display result.video.
- Upgrade paths for higher UGC quality (pricier): `fal-ai/kling-video`
  (~$0.07/s), `fal-ai/wan` (~$0.05/s), `fal-ai/minimax` Hailuo (~$0.49/video).
