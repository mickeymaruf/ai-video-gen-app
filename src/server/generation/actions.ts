"use server";

import { fal, VIDEO_MODEL } from "@/lib/fal";
import type { MinimaxVideoOutput, PollResult } from "@/types/generation";

/** Uploads the product image, queues a 9:16 image-to-video job, returns its id. */
export async function submitVideoGeneration(formData: FormData): Promise<string> {
  const image = formData.get("image");
  if (!(image instanceof File)) {
    throw new Error("A product image is required to generate a video.");
  }

  const prompt = [formData.get("script"), formData.get("visualGuide")]
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean)
    .join("\n\n");

  const imageUrl = await fal.storage.upload(image);
  const { request_id } = await fal.queue.submit(VIDEO_MODEL, {
    input: { prompt, image_url: imageUrl, prompt_optimizer: true },
  });

  return request_id;
}

/** One poll cycle: live status + logs, plus the video URL once completed. */
export async function pollVideoGeneration(requestId: string): Promise<PollResult> {
  const status = await fal.queue.status(VIDEO_MODEL, { requestId, logs: true });
  const logs = ("logs" in status ? status.logs : []).map(({ message, timestamp }) => ({
    message,
    timestamp,
  }));

  if (status.status !== "COMPLETED") {
    return { status: status.status, logs, videoUrl: null };
  }

  const result = await fal.queue.result(VIDEO_MODEL, { requestId });
  const output = result.data as MinimaxVideoOutput;
  return { status: "COMPLETED", logs, videoUrl: output.video?.url ?? null };
}
