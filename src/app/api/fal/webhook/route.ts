import { revalidatePath } from "next/cache";

import { verifyFalWebhook } from "@/lib/fal-webhook";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

interface FalWebhookBody {
  request_id?: string;
  status?: "OK" | "ERROR";
  payload?: { video?: { url?: string } } | null;
  payload_error?: string;
  error?: string;
}

/**
 * Durable source of truth for generation results: fal POSTs here when a job
 * finishes, so the scene reaches COMPLETED/ERROR even with no tab open.
 * Idempotent — fal retries and re-delivers for the same request_id.
 */
export async function POST(req: Request): Promise<Response> {
  const raw = await req.text();
  if (!(await verifyFalWebhook(raw, req.headers))) {
    return new Response("Invalid signature", { status: 401 });
  }

  let body: FalWebhookBody;
  try {
    body = JSON.parse(raw) as FalWebhookBody;
  } catch {
    return new Response("Invalid body", { status: 400 });
  }

  if (!body.request_id) return new Response("ok", { status: 200 });

  const scene = await prisma.scene.findFirst({
    where: { requestId: body.request_id },
  });
  if (!scene) return new Response("ok", { status: 200 });

  const succeeded = body.status === "OK" && body.payload != null;
  await prisma.scene.update({
    where: { id: scene.id },
    data: succeeded
      ? { status: "COMPLETED", videoUrl: body.payload?.video?.url ?? null, error: null }
      : { status: "ERROR", error: body.error ?? body.payload_error ?? "Generation failed." },
  });

  revalidatePath(`/editor/${scene.projectId}`);
  return new Response("ok", { status: 200 });
}
