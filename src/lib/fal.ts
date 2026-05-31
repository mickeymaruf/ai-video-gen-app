import { fal } from "@fal-ai/client";

// Single service-layer entry point for Fal.ai. Server-only: credentials are
// read from FAL_KEY and never exposed to the client.
fal.config({ credentials: process.env.FAL_KEY });

// The catalog of selectable models lives in `src/lib/video-models.ts`.
export { fal };
