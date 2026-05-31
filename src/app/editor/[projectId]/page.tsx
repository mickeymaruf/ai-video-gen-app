import { notFound } from "next/navigation";

import { EditorWorkspace } from "@/components/editor/editor-workspace";
import { prisma } from "@/lib/prisma";
import type { AspectRatio, SceneData } from "@/types/project";

/**
 * Editor for a single project. Every scene is rendered at once on a scrollable
 * page; navigation is scrolling (with a shareable `#scene-<id>` hash), not a
 * full page navigation. Each scene's persisted status drives whether its editor
 * resumes polling after a refresh.
 */
export default async function ProjectEditorPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const [projects, project] = await Promise.all([
    prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, aspectRatio: true },
    }),
    prisma.project.findUnique({
      where: { id: projectId },
      include: { scenes: { orderBy: { order: "asc" } } },
    }),
  ]);

  if (!project) notFound();

  const scenes: SceneData[] = project.scenes.map((scene) => ({
    id: scene.id,
    script: scene.script,
    visualGuide: scene.visualGuide,
    imageUrl: scene.imageUrl,
    requestId: scene.requestId,
    status: scene.status,
    videoUrl: scene.videoUrl,
    error: scene.error,
    type: scene.type,
    language: scene.language,
    model: scene.model,
    sound: scene.sound,
    startImageUrl: scene.startImageUrl,
    endImageUrl: scene.endImageUrl,
  }));

  return (
    <EditorWorkspace
      title={project.title}
      projects={projects.map((p) => ({
        ...p,
        aspectRatio: p.aspectRatio as AspectRatio,
      }))}
      activeProjectId={project.id}
      scenes={scenes}
    />
  );
}
