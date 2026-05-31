import type { AspectRatio } from "@/types/project";

/**
 * Catalog of the top fal.ai image-to-video models the editor can target, plus a
 * pure mapper from the editor's scene config to each model's input shape.
 *
 * This is data + pure functions only (no fal client), so it is safe to import
 * from client components for the Model dropdown and capability-driven UI. The
 * actual fal queue calls stay in `src/server/generation/actions.ts` (invariant
 * #8: fal interactions isolated behind a single service layer).
 */
export interface VideoModel {
  /** fal endpoint id, e.g. `fal-ai/veo3.1/image-to-video`. */
  id: string;
  /** Human label for the Model dropdown. */
  label: string;
  /** One-line capability summary. */
  description: string;
  /** Input param for the start/primary image (varies per model). */
  startImageParam: string;
  /** Input param for the end frame, or `null` if the model has no end frame. */
  endImageParam: string | null;
  /** Boolean input param toggling native audio, or `null` if unsupported. */
  audioParam: string | null;
  /** Whether to send `prompt_optimizer: true`. */
  promptOptimizer: boolean;
  /** Project aspect ratios the model accepts (empty = aspect not configurable). */
  aspectRatios: AspectRatio[];
}

export const VIDEO_MODELS: VideoModel[] = [
  {
    id: "fal-ai/minimax-video/image-to-video",
    label: "MiniMax Video",
    description: "Fast, reliable baseline image-to-video.",
    startImageParam: "image_url",
    endImageParam: null,
    audioParam: null,
    promptOptimizer: true,
    aspectRatios: [],
  },
  {
    id: "fal-ai/veo3.1/image-to-video",
    label: "Google Veo 3.1",
    description: "State-of-the-art cinematic video with native audio.",
    startImageParam: "image_url",
    endImageParam: null,
    audioParam: "generate_audio",
    promptOptimizer: false,
    aspectRatios: ["9:16", "16:9"],
  },
  {
    id: "fal-ai/kling-video/v2.6/pro/image-to-video",
    label: "Kling 2.6 Pro",
    description: "Fluid motion, start + end frame, native audio.",
    startImageParam: "start_image_url",
    endImageParam: "end_image_url",
    audioParam: "generate_audio",
    promptOptimizer: false,
    aspectRatios: [],
  },
  {
    id: "fal-ai/bytedance/seedance/v1.5/pro/image-to-video",
    label: "Seedance 1.5 Pro",
    description: "High quality with audio, start + end frame control.",
    startImageParam: "image_url",
    endImageParam: "end_image_url",
    audioParam: "generate_audio",
    promptOptimizer: false,
    aspectRatios: ["9:16", "16:9", "1:1"],
  },
  {
    id: "fal-ai/minimax/hailuo-02/standard/image-to-video",
    label: "MiniMax Hailuo 02",
    description: "Advanced motion with optional end frame.",
    startImageParam: "image_url",
    endImageParam: "end_image_url",
    audioParam: null,
    promptOptimizer: true,
    aspectRatios: [],
  },
];

export const DEFAULT_MODEL_ID = VIDEO_MODELS[0].id;

/** Resolve a model by id, falling back to the default if unknown/unset. */
export function getVideoModel(id: string | null | undefined): VideoModel {
  return VIDEO_MODELS.find((model) => model.id === id) ?? VIDEO_MODELS[0];
}

export interface ModelInputParams {
  prompt: string;
  /** Start frame URL — required by every model. */
  startImageUrl: string;
  /** End frame URL — sent only when the model supports one. */
  endImageUrl: string | null;
  /** Whether native audio should be generated. */
  sound: boolean;
  /** Project aspect ratio — sent only when the model accepts it. */
  aspectRatio: AspectRatio;
}

/**
 * Build the fal input object for `model` from the editor's scene config, sending
 * only the params the model actually supports (end frame, audio, aspect ratio,
 * prompt optimizer) so we never submit an invalid field.
 */
export function buildModelInput(
  model: VideoModel,
  params: ModelInputParams,
): Record<string, unknown> {
  const input: Record<string, unknown> = {
    prompt: params.prompt,
    [model.startImageParam]: params.startImageUrl,
  };

  if (model.endImageParam && params.endImageUrl) {
    input[model.endImageParam] = params.endImageUrl;
  }
  if (model.audioParam) {
    input[model.audioParam] = params.sound;
  }
  if (model.promptOptimizer) {
    input.prompt_optimizer = true;
  }
  if (model.aspectRatios.includes(params.aspectRatio)) {
    input.aspect_ratio = params.aspectRatio;
  }

  return input;
}
