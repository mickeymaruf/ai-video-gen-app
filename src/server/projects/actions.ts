"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

/** Creates a project seeded with one empty scene; returns the project id. */
export async function createProject(): Promise<string> {
  const project = await prisma.project.create({
    data: { scenes: { create: {} } },
  });
  revalidatePath("/editor");
  return project.id;
}

/** Appends a blank scene to a project; returns the new scene id. */
export async function createScene(projectId: string): Promise<string> {
  const order = await prisma.scene.count({ where: { projectId } });
  const scene = await prisma.scene.create({ data: { projectId, order } });
  revalidatePath(`/editor/${projectId}`);
  return scene.id;
}
