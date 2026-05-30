/** Shared contracts for the Fal.ai video generation service. */

export type QueueState = "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED";

/** Persisted scene status — mirrors the `GenStatus` enum in the Prisma schema. */
export type GenStatus =
  | "IDLE"
  | "SUBMITTING"
  | "IN_QUEUE"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "ERROR";

export interface GenerationLog {
  message: string;
  timestamp: string;
}

/** One poll snapshot returned to the client during queued generation. */
export interface PollResult {
  status: QueueState;
  logs: GenerationLog[];
  videoUrl: string | null;
}

/** Result payload shape for `fal-ai/minimax-video/image-to-video`. */
export interface MinimaxVideoOutput {
  video: { url: string };
}
