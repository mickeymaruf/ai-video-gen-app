import type { GenStatus } from "./generation";

/** Supported project aspect ratios — persisted on `Project.aspectRatio`. */
export type AspectRatio = "9:16" | "16:9" | "1:1";

export interface AspectRatioOption {
  value: AspectRatio;
  label: string;
}

export const ASPECT_RATIOS: AspectRatioOption[] = [
  { value: "9:16", label: "Portrait" },
  { value: "16:9", label: "Landscape" },
  { value: "1:1", label: "Square" },
];

export const DEFAULT_ASPECT_RATIO: AspectRatio = "9:16";

export interface ProjectSummary {
  id: string;
  title: string;
  aspectRatio: AspectRatio;
}

export interface SceneSummary {
  id: string;
  order: number;
  status: GenStatus;
}

/** The editor's view of a single scene — serializable, no Prisma Date fields. */
export interface SceneData {
  id: string;
  script: string;
  visualGuide: string;
  imageUrl: string | null;
  requestId: string | null;
  status: GenStatus;
  videoUrl: string | null;
  error: string | null;
}
