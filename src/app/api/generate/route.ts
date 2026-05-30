import { randomUUID } from "crypto";
import { jobStore } from "@/lib/jobStore";
import { runWorker } from "@/lib/worker";

export async function POST(req: Request) {
  const formData = await req.formData();

  const file = formData.get("images") as File;
  const prompt = (formData.get("prompt") as string) || "";

  const jobId = randomUUID();

  jobStore.set(jobId, {
    status: "queued",
    image: null,
    video: null,
  });

  runWorker(jobId, file, prompt);

  return Response.json({ jobId });
}
