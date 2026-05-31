"use server";

import { revalidatePath } from "next/cache";

import { fal } from "@/lib/fal";
import { prisma } from "@/lib/prisma";
import { completeScene } from "@/server/generation/complete";
import { buildModelInput, getVideoModel } from "@/lib/video-models";
import type { VideoOutput, PollResult } from "@/types/generation";
import type { AspectRatio } from "@/types/project";

function field(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** Compose the model prompt from the creative style, spoken language, and the two prompts. */
function buildPrompt(input: {
  type: string;
  language: string;
  script: string;
  visualGuide: string;
}): string {
  const directives = [
    input.type && `Style: ${input.type}`,
    input.language && `Spoken language: ${input.language}`,
  ]
    .filter(Boolean)
    .join(". ");
  const body = [input.script, input.visualGuide].filter(Boolean).join("\n\n");
  return [directives, body].filter(Boolean).join("\n\n");
}

/** Upload a freshly selected file, otherwise reuse an explicit/persisted URL. */
async function resolveImageUrl(
  file: FormDataEntryValue | null,
  explicit: string,
  persisted: string | null,
): Promise<string | null> {
  if (file instanceof File && file.size > 0) {
    return fal.storage.upload(file);
  }
  return explicit || persisted;
}

/**
 * Persists the scene's inputs, queues a 9:16 image-to-video job, and stores the
 * request id + status so the run survives a refresh. Regenerating updates the
 * same scene in place (a new version is appended on completion) — previous
 * `videoUrl`/versions are left untouched until the new run succeeds (invariant #7).
 */
export async function submitVideoGeneration(
  sceneId: string,
  formData: FormData,
): Promise<{ requestId: string }> {
  const scene = await prisma.scene.findUniqueOrThrow({
    where: { id: sceneId },
    include: { project: true },
  });

  const script = field(formData, "script");
  const visualGuide = field(formData, "visualGuide");
  const type = field(formData, "type") || scene.type;
  const language = field(formData, "language") || scene.language;
  const sound = field(formData, "sound") !== "false";
  const model = getVideoModel(field(formData, "model") || scene.model);

  // Product image and the optional start/end reference cards.
  const imageUrl = await resolveImageUrl(
    formData.get("image"),
    field(formData, "imageUrl"),
    scene.imageUrl,
  );
  const startImageUrl = await resolveImageUrl(
    formData.get("startCard"),
    field(formData, "startImageUrl"),
    scene.startImageUrl,
  );
  const endImageUrl = model.endImageParam
    ? await resolveImageUrl(
        formData.get("endCard"),
        field(formData, "endImageUrl"),
        scene.endImageUrl,
      )
    : null;

  // The start frame drives the model: an explicit start card wins, else the product image.
  const startFrame = startImageUrl ?? imageUrl;
  if (!startFrame) {
    throw new Error("A product image or start card is required to generate a video.");
  }

  const webhookUrl = process.env.APP_URL
    ? `${process.env.APP_URL}/api/fal/webhook`
    : undefined;
  const { request_id } = await fal.queue.submit(model.id, {
    input: buildModelInput(model, {
      prompt: buildPrompt({ type, language, script, visualGuide }),
      startImageUrl: startFrame,
      endImageUrl,
      sound,
      aspectRatio: scene.project.aspectRatio as AspectRatio,
    }),
    webhookUrl,
  });

  // Always update the same scene — regenerate appends a version on completion
  // rather than forking a new scene. The previous videoUrl is left intact so a
  // failed run never clobbers the last good output (invariant #7).
  await prisma.scene.update({
    where: { id: sceneId },
    data: {
      script,
      visualGuide,
      type,
      language,
      model: model.id,
      sound,
      imageUrl,
      startImageUrl,
      endImageUrl,
      requestId: request_id,
      status: "IN_QUEUE",
      error: null,
    },
  });

  revalidatePath(`/editor/${scene.projectId}`);
  return { requestId: request_id };
}

/** One poll cycle: live status + logs, persisting status (and the URL once done). */
export async function pollVideoGeneration(
  sceneId: string,
  requestId: string,
  model: string,
): Promise<PollResult> {
  // The model endpoint is passed in (the client already holds it) so this
  // hot loop — called every poll interval — never reads the DB just to recover
  // it. getVideoModel guards against an unknown id by falling back to default.
  const modelId = getVideoModel(model).id;

  const status = await fal.queue.status(modelId, { requestId, logs: true });
  const logs = ("logs" in status ? status.logs : []).map(({ message, timestamp }) => ({
    message,
    timestamp,
  }));

  if (status.status !== "COMPLETED") {
    await prisma.scene.update({ where: { id: sceneId }, data: { status: status.status } });
    return { status: status.status, logs, videoUrl: null };
  }

  const result = await fal.queue.result(modelId, { requestId });
  const output = result.data as VideoOutput;
  const videoUrl = output.video?.url ?? null;
  await completeScene(sceneId, videoUrl);
  return { status: "COMPLETED", logs, videoUrl };
}
