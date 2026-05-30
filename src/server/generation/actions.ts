"use server";

import { revalidatePath } from "next/cache";

import { fal, VIDEO_MODEL } from "@/lib/fal";
import { prisma } from "@/lib/prisma";
import type { MinimaxVideoOutput, PollResult } from "@/types/generation";

function field(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Persists the scene's inputs, queues a 9:16 image-to-video job, and stores the
 * request id + status so the run survives a refresh. A scene that has already
 * run forks a new scene instead of overwriting its result.
 */
export async function submitVideoGeneration(
  sceneId: string,
  formData: FormData,
): Promise<{ sceneId: string; requestId: string }> {
  const scene = await prisma.scene.findUniqueOrThrow({ where: { id: sceneId } });

  const script = field(formData, "script");
  const visualGuide = field(formData, "visualGuide");

  const image = formData.get("image");
  let imageUrl = field(formData, "imageUrl") || scene.imageUrl;
  if (image instanceof File && image.size > 0) {
    imageUrl = await fal.storage.upload(image);
  }
  if (!imageUrl) {
    throw new Error("A product image is required to generate a video.");
  }

  const prompt = [script, visualGuide].filter(Boolean).join("\n\n");
  const { request_id } = await fal.queue.submit(VIDEO_MODEL, {
    input: { prompt, image_url: imageUrl, prompt_optimizer: true },
  });

  const data = {
    script,
    visualGuide,
    imageUrl,
    requestId: request_id,
    status: "IN_QUEUE" as const,
    videoUrl: null,
    error: null,
  };

  const alreadyRan =
    scene.status === "COMPLETED" || scene.status === "ERROR" || !!scene.requestId;
  const target = alreadyRan
    ? await prisma.scene.create({
        data: {
          projectId: scene.projectId,
          order: await prisma.scene.count({ where: { projectId: scene.projectId } }),
          ...data,
        },
      })
    : await prisma.scene.update({ where: { id: sceneId }, data });

  revalidatePath(`/editor/${scene.projectId}`);
  return { sceneId: target.id, requestId: request_id };
}

/** One poll cycle: live status + logs, persisting status (and the URL once done). */
export async function pollVideoGeneration(
  sceneId: string,
  requestId: string,
): Promise<PollResult> {
  const status = await fal.queue.status(VIDEO_MODEL, { requestId, logs: true });
  const logs = ("logs" in status ? status.logs : []).map(({ message, timestamp }) => ({
    message,
    timestamp,
  }));

  if (status.status !== "COMPLETED") {
    await prisma.scene.update({ where: { id: sceneId }, data: { status: status.status } });
    return { status: status.status, logs, videoUrl: null };
  }

  const result = await fal.queue.result(VIDEO_MODEL, { requestId });
  const output = result.data as MinimaxVideoOutput;
  const videoUrl = output.video?.url ?? null;
  await prisma.scene.update({
    where: { id: sceneId },
    data: { status: "COMPLETED", videoUrl },
  });
  return { status: "COMPLETED", logs, videoUrl };
}

/** Records a failed generation so the error survives a refresh. */
export async function failScene(sceneId: string, message: string): Promise<void> {
  await prisma.scene.update({
    where: { id: sceneId },
    data: { status: "ERROR", error: message },
  });
}
