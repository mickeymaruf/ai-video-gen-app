import { fal } from "@fal-ai/client";

// Single service-layer entry point for Fal.ai. Server-only: credentials are
// read from FAL_KEY and never exposed to the client.
fal.config({ credentials: process.env.FAL_KEY });

export const VIDEO_MODEL = "fal-ai/minimax-video/image-to-video";

export { fal };
