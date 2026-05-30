"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import {
  ASPECT_RATIOS,
  DEFAULT_ASPECT_RATIO,
  type AspectRatio,
} from "@/types/project";

const VALID_RATIOS = new Set<AspectRatio>(ASPECT_RATIOS.map((r) => r.value));

/** Falls back to the default when an unknown ratio reaches the server. */
function normalizeAspectRatio(value: string | undefined): AspectRatio {
  return value && VALID_RATIOS.has(value as AspectRatio)
    ? (value as AspectRatio)
    : DEFAULT_ASPECT_RATIO;
}

/**
 * Creates a project (seeded with one empty scene) using the supplied name and
 * aspect ratio; returns the new project id. Called from the New Project modal.
 */
export async function createProject(input?: {
  title?: string;
  aspectRatio?: AspectRatio;
}): Promise<string> {
  const title = input?.title?.trim();
  const project = await prisma.project.create({
    data: {
      ...(title ? { title } : {}),
      aspectRatio: normalizeAspectRatio(input?.aspectRatio),
      scenes: { create: {} },
    },
  });
  revalidatePath("/editor");
  return project.id;
}

/**
 * Saves the project settings modal: renames the project and sets its aspect
 * ratio. Project cost is intentionally skipped for now (see spec 08).
 */
export async function updateProject(
  projectId: string,
  input: { title?: string; aspectRatio?: AspectRatio },
): Promise<void> {
  const title = input.title?.trim();
  await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(title ? { title } : {}),
      aspectRatio: normalizeAspectRatio(input.aspectRatio),
    },
  });
  revalidatePath("/editor");
  revalidatePath(`/editor/${projectId}`);
}

/** Appends a blank scene to a project; returns the new scene id. */
export async function createScene(projectId: string): Promise<string> {
  const order = await prisma.scene.count({ where: { projectId } });
  const scene = await prisma.scene.create({ data: { projectId, order } });
  revalidatePath(`/editor/${projectId}`);
  return scene.id;
}
