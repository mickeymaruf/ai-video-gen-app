"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { EditorSidebar } from "@/components/editor/editor-sidebar";
import { SceneEditor } from "@/components/editor/scene-editor";
import { downloadFile } from "@/lib/download";
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
    versions: [],
  };
}

/** Breathing room (px) left above a scene when it's scrolled to the top. */
const SCENE_SCROLL_OFFSET = 24;

/**
 * The editor shell for a single project: a full-height sidebar (scene list +
 * Add Scene) beside a right column whose fixed navbar stays pinned while the
 * vertically-stacked scene cards scroll beneath it.
 *
 * All of the project's scenes render at once — navigation is scrolling, not a
 * full page navigation. Clicking a scene scrolls its card to the top of the
 * scene column and writes a shareable `#scene-<id>` hash to the URL (via
 * history.replaceState, so it neither re-renders nor adds history entries);
 * opening such a link jumps straight to that scene on load. "Add Scene" appends
 * a temporary scene to client state for instant feedback; it only becomes a DB
 * row when the user generates on it, at which point the temp card is dropped
 * and the persisted scene is reloaded.
 *
 * The scroll targets the inner column directly (container.scrollTo) rather than
 * element.scrollIntoView(): scrollIntoView cascades up every scroll ancestor
 * and, because the column sits below the fixed navbar, would scroll the whole
 * document to align the scene to the viewport top — shoving the navbar out of
 * view. Scrolling the container keeps the movement contained to the column.
 */
export function EditorWorkspace({
  title,
  projects,
  activeProjectId,
  scenes,
}: EditorWorkspaceProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLElement>(null);
  const [tempScenes, setTempScenes] = useState<SceneData[]>([]);
  // Each scene reports the video URL of its currently selected version here so
  // the navbar's Export can download exactly what's on screen. Bail on no-op
  // updates (same ref) so the per-render child callbacks can't loop.
  const [selectedVideos, setSelectedVideos] = useState<
    Record<string, string | null>
  >({});

  const allScenes = [...scenes, ...tempScenes];

  const handleSelectedVideoChange = useCallback(
    (sceneId: string, videoUrl: string | null) => {
      setSelectedVideos((prev) =>
        prev[sceneId] === videoUrl ? prev : { ...prev, [sceneId]: videoUrl },
      );
    },
    [],
  );

  // Download every scene's currently selected video, named by scene order.
  // Only scenes with a successful, selected video are included (invariant #6);
  // sequential so the browser groups them into one permission prompt.
  const exportable = allScenes
    .map((scene, index) => ({ url: selectedVideos[scene.id], index }))
    .filter((s): s is { url: string; index: number } => Boolean(s.url));

  const handleExport = async () => {
    for (const { url, index } of exportable) {
      await downloadFile(url, `scene-${index + 1}.mp4`);
    }
  };

  // Scroll ONLY the scene column to a card by setting the container's scrollTop
  // directly — never the window. (See the component doc for why scrollIntoView
  // is avoided here.)
  const scrollToScene = useCallback(
    (sceneId: string, behavior: ScrollBehavior = "smooth") => {
      const container = scrollRef.current;
      const target = document.getElementById(`scene-${sceneId}`);
      if (!container || !target) return;
      const top =
        container.scrollTop +
        target.getBoundingClientRect().top -
        container.getBoundingClientRect().top -
        SCENE_SCROLL_OFFSET;
      container.scrollTo({ top: Math.max(0, top), behavior });
    },
    [],
  );

  // Honor a shared `#scene-<id>` link by jumping to that scene on load.
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash.startsWith("scene-")) return;
    const sceneId = hash.slice("scene-".length);
    // Wait for layout, then jump instantly (no animation on first paint).
    requestAnimationFrame(() => scrollToScene(sceneId, "auto"));
  }, [scrollToScene]);

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
    <div className="fixed inset-0 flex overflow-hidden bg-background">
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
        <EditorNavbar
          title={title}
          onExport={handleExport}
          exportCount={exportable.length}
        />
        <main
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6"
        >
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
                      onSelectedVideoChange={(url) =>
                        handleSelectedVideoChange(scene.id, url)
                      }
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
