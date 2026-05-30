import type { GenStatus } from "./generation";

export interface ProjectSummary {
  id: string;
  title: string;
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
