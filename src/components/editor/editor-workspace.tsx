"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { EditorSidebar } from "@/components/editor/editor-sidebar";
import { SceneEditor } from "@/components/editor/scene-editor";
import { DEFAULT_MODEL_ID } from "@/lib/video-models";
import {
  LANGUAGE_OPTIONS,
  TYPE_OPTIONS,
  type ProjectSummary,
  type SceneData,
} from "@/types/project";

interface EditorWorkspaceProps {
  projects: ProjectSummary[];
  activeProjectId: string;
  scenes: SceneData[];
}

/**
 * A blank, client-only scene that lives in memory until the user hits Generate.
 * Fields mirror the `Scene` model defaults so it renders identically to a
 * freshly-persisted scene (and so refreshing before generating just drops it).
 */
function makeTempScene(): SceneData {
  return {
    id: `temp-${crypto.randomUUID()}`,
    script: "",
    visualGuide: "",
    imageUrl: null,
    requestId: null,
    status: "IDLE",
    videoUrl: null,
    error: null,
    type: TYPE_OPTIONS[0],
    language: LANGUAGE_OPTIONS[0],
    model: DEFAULT_MODEL_ID,
    sound: true,
    startImageUrl: null,
    endImageUrl: null,
  };
}

/** Smooth-scroll the scrollable scene area to a scene's anchor card. */
function scrollToScene(sceneId: string) {
  document
    .getElementById(`scene-${sceneId}`)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Coordinates the editor's two regions for a single project: the left sidebar
 * (scene list + Add Scene) and the main, vertically-stacked scene cards.
 *
 * All of the project's scenes render at once — navigation is scrolling, not a
 * `?scene=` query. "Add Scene" appends a temporary scene to client state for
 * instant feedback; it only becomes a DB row when the user generates on it, at
 * which point the temp card is dropped and the persisted scene is reloaded.
 */
export function EditorWorkspace({
  projects,
  activeProjectId,
  scenes,
}: EditorWorkspaceProps) {
  const router = useRouter();
  const [tempScenes, setTempScenes] = useState<SceneData[]>([]);

  const allScenes = [...scenes, ...tempScenes];

  const handleAddScene = () => {
    const tempScene = makeTempScene();
    setTempScenes((prev) => [...prev, tempScene]);
    // Scroll once the new card has rendered.
    requestAnimationFrame(() => scrollToScene(tempScene.id));
  };

  const handleScenePersisted = (tempId: string) => {
    setTempScenes((prev) => prev.filter((scene) => scene.id !== tempId));
    router.refresh();
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      <EditorSidebar
        projects={projects}
        scenes={allScenes.map((scene, index) => ({
          id: scene.id,
          order: index,
          status: scene.status,
        }))}
        activeProjectId={activeProjectId}
        onAddScene={handleAddScene}
        onSelectScene={scrollToScene}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col gap-6">
          {allScenes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No scenes yet.</p>
          ) : (
            allScenes.map((scene, index) => {
              const isTemporary = index >= scenes.length;
              return (
                <div key={scene.id} id={`scene-${scene.id}`} className="scroll-mt-6">
                  <SceneEditor
                    projectId={activeProjectId}
                    index={index}
                    scene={scene}
                    isTemporary={isTemporary}
                    onPersisted={() => handleScenePersisted(scene.id)}
                  />
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
