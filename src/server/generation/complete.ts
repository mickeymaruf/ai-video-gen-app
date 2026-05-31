import { prisma } from "@/lib/prisma";

/**
 * Marks a scene COMPLETED and appends a new video version — once. Both the
 * client poll loop and the fal webhook can report the same completion, so the
 * version is only appended when the scene is transitioning *into* COMPLETED
 * (status-guarded), keeping the history free of duplicates.
 */
export async function completeScene(
  sceneId: string,
  videoUrl: string | null,
): Promise<void> {
  const scene = await prisma.scene.findUnique({
    where: { id: sceneId },
    select: { status: true },
  });
  await prisma.scene.update({
    where: { id: sceneId },
    data: { status: "COMPLETED", videoUrl, error: null },
  });
  if (videoUrl && scene?.status !== "COMPLETED") {
    await prisma.sceneVersion.create({ data: { sceneId, videoUrl } });
  }
}
