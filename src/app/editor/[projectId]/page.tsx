import { notFound } from "next/navigation";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { EditorSidebar } from "@/components/editor/editor-sidebar";
import { SceneEditor } from "@/components/editor/scene-editor";
import { prisma } from "@/lib/prisma";
import type { AspectRatio } from "@/types/project";

/**
 * Editor for a single project. The project id lives in the path and the active
 * scene in `?scene=`, so a refresh restores both — and each scene's persisted
 * status drives whether the editor resumes polling.
 */
export default async function ProjectEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ scene?: string }>;
}) {
  const { projectId } = await params;
  const { scene: sceneParam } = await searchParams;

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

  const scenes = project.scenes;
  const activeIndex = Math.max(0, scenes.findIndex((s) => s.id === sceneParam));
  const activeScene = scenes[activeIndex];

  return (
    <div className="flex h-screen flex-col bg-background">
      <EditorNavbar title={project.title} />
      <div className="flex flex-1 overflow-hidden">
        <EditorSidebar
          projects={projects.map((p) => ({
            ...p,
            aspectRatio: p.aspectRatio as AspectRatio,
          }))}
          scenes={scenes.map((s) => ({ id: s.id, order: s.order, status: s.status }))}
          activeProjectId={project.id}
          activeSceneId={activeScene?.id}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {activeScene ? (
            <SceneEditor
              key={activeScene.id}
              projectId={project.id}
              index={activeIndex}
              scene={{
                id: activeScene.id,
                script: activeScene.script,
                visualGuide: activeScene.visualGuide,
                imageUrl: activeScene.imageUrl,
                requestId: activeScene.requestId,
                status: activeScene.status,
                videoUrl: activeScene.videoUrl,
                error: activeScene.error,
                type: activeScene.type,
                language: activeScene.language,
                model: activeScene.model,
                sound: activeScene.sound,
                startImageUrl: activeScene.startImageUrl,
                endImageUrl: activeScene.endImageUrl,
              }}
            />
          ) : (
            <p className="text-sm text-muted-foreground">No scenes yet.</p>
          )}
        </main>
      </div>
    </div>
  );
}
