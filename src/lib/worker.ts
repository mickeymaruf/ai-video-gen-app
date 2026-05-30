import { fal } from "@fal-ai/client";
import { jobStore } from "@/lib/jobStore";

fal.config({
  credentials: process.env.FAL_KEY!,
});

async function toBase64(file: File) {
  const buffer = await file.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}

export async function runWorker(jobId: string, file: File, prompt: string) {
  try {
    jobStore.set(jobId, { status: "processing" });

    // STEP 1 — IMAGE (FLUX DEV)
    const base64 = await toBase64(file);

    const imageRes = await fal.subscribe("fal-ai/flux/dev", {
      input: {
        prompt:
          prompt ||
          "cinematic product photography, studio lighting, ultra realistic",
        image_base64: base64,
        strength: 0.75,
      },
    });

    const image = imageRes.data.images?.[0]?.url;

    jobStore.set(jobId, {
      status: "processing",
      image,
    });

    // STEP 2 — VIDEO (MINIMAX)
    const videoRes = await fal.subscribe(
      "fal-ai/minimax-video/image-to-video",
      {
        input: {
          image_url: image,
          prompt:
            "cinematic luxury product ad, slow camera orbit, soft lighting",
          duration: 5,
          aspect_ratio: "9:16",
        },
      },
    );

    const video = videoRes.data.video?.url;

    jobStore.set(jobId, {
      status: "done",
      image,
      video,
    });
  } catch (e) {
    jobStore.set(jobId, {
      status: "failed",
    });
  }
}
