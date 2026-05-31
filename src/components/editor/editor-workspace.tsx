"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { EditorNavbar } from "@/components/editor/editor-navbar";
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
  title: string;
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

/** Scroll the scrollable scene area to a scene's anchor card. */
function scrollToScene(sceneId: string, behavior: ScrollBehavior = "smooth") {
  document
    .getElementById(`scene-${sceneId}`)
    ?.scrollIntoView({ behavior, block: "start" });
}

/**
 * The editor shell for a single project: a full-height sidebar (scene list +
 * Add Scene) beside a right column whose fixed navbar stays pinned while the
 * vertically-stacked scene cards scroll beneath it.
 *
 * All of the project's scenes render at once — navigation is scrolling, not a
 * full page navigation. Clicking a scene smooth-scrolls to its card and writes
 * a shareable `#scene-<id>` hash to the URL (via history.replaceState, so it
 * neither re-renders nor adds history entries); opening such a link jumps
 * straight to that scene on load. "Add Scene" appends a temporary scene to
 * client state for instant feedback; it only becomes a DB row when the user
 * generates on it, at which point the temp card is dropped and the persisted
 * scene is reloaded.
 */
export function EditorWorkspace({
  title,
  projects,
  activeProjectId,
  scenes,
}: EditorWorkspaceProps) {
  const router = useRouter();
  const [tempScenes, setTempScenes] = useState<SceneData[]>([]);

  const allScenes = [...scenes, ...tempScenes];

  // Honor a shared `#scene-<id>` link by jumping to that scene on load.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id.startsWith("scene-")) return;
    requestAnimationFrame(() =>
      document.getElementById(id)?.scrollIntoView({ block: "start" }),
    );
  }, []);

  const handleAddScene = () => {
    const tempScene = makeTempScene();
    setTempScenes((prev) => [...prev, tempScene]);
    // Scroll once the new card has rendered.
    requestAnimationFrame(() => scrollToScene(tempScene.id));
  };

  // Sidebar scene click: smooth-scroll (fast, as before) and reflect the scene
  // in the URL so it can be shared, without a navigation or re-render.
  const handleSelectScene = (sceneId: string) => {
    scrollToScene(sceneId);
    window.history.replaceState(window.history.state, "", `#scene-${sceneId}`);
  };

  const handleScenePersisted = (tempId: string) => {
    setTempScenes((prev) => prev.filter((scene) => scene.id !== tempId));
    router.refresh();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <EditorSidebar
        projects={projects}
        scenes={allScenes.map((scene, index) => ({
          id: scene.id,
          order: index,
          status: scene.status,
        }))}
        activeProjectId={activeProjectId}
        onAddScene={handleAddScene}
        onSelectScene={handleSelectScene}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <EditorNavbar title={title} />
        <main className="min-h-0 flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-6">
            {allScenes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No scenes yet.</p>
            ) : (
              allScenes.map((scene, index) => {
                const isTemporary = index >= scenes.length;
                return (
                  <div
                    key={scene.id}
                    id={`scene-${scene.id}`}
                    className="scroll-mt-6"
                  >
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
    </div>
  );
}
