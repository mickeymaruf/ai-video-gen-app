import { jobStore } from "@/lib/jobStore";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");

  if (!jobId || !jobStore.has(jobId)) {
    return Response.json({ status: "not_found" });
  }

  return Response.json(jobStore.get(jobId));
}
