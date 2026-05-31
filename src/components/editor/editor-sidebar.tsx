"use client";

import { useState } from "react";
import Link from "next/link";
import { Image as ImageIcon, Loader2, Plus, Settings, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProjectSettingsModal } from "@/components/editor/project-settings-modal";
import type { ProjectSummary, SceneSummary } from "@/types/project";
import { cn } from "@/lib/utils";

interface EditorSidebarProps {
  projects: ProjectSummary[];
  scenes: SceneSummary[];
  activeProjectId?: string;
  /** Append a temporary scene client-side (instant, persists only on Generate). */
  onAddScene?: () => void;
  /** Smooth-scroll the main area to a scene's anchor card. */
  onSelectScene?: (sceneId: string) => void;
}

/** Small status indicator shown next to each scene in the tree. */
function SceneStatus({ status }: { status: SceneSummary["status"] }) {
  if (status === "SUBMITTING" || status === "IN_QUEUE" || status === "IN_PROGRESS") {
    return <Loader2 className="size-3.5 animate-spin text-primary" />;
  }
  if (status === "COMPLETED") return <span className="size-2 rounded-full bg-success" />;
  if (status === "ERROR") return <span className="size-2 rounded-full bg-destructive" />;
  return null;
}

/**
 * Left navigation sidebar. Lists every project; the active project expands to a
 * scene list. "New Project" opens the creation modal (name + aspect ratio) and
 * the per-project gear opens the same modal in settings mode. Clicking a scene
 * smooth-scrolls the main area to its card; "Add Scene" appends a temporary
 * scene client-side (it only persists once the user generates on it).
 */
export function EditorSidebar({
  projects,
  scenes,
  activeProjectId,
  onAddScene,
  onSelectScene,
}: EditorSidebarProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSceneId, setSelectedSceneId] = useState<string | undefined>();
  const [modalConfig, setModalConfig] = useState<{
    mode: "create" | "settings";
    project?: ProjectSummary;
  }>({ mode: "create" });

  const openCreate = () => {
    setModalConfig({ mode: "create" });
    setModalOpen(true);
  };

  const openSettings = (project: ProjectSummary) => {
    setModalConfig({ mode: "settings", project });
    setModalOpen(true);
  };

  const selectScene = (sceneId: string) => {
    setSelectedSceneId(sceneId);
    onSelectScene?.(sceneId);
  };

  return (
    <aside className="flex w-64 shrink-0 flex-col gap-4 overflow-y-auto border-r bg-card p-4">
      <Button
        onClick={openCreate}
        className="h-11 w-full rounded-lg text-sm font-semibold"
      >
        <Plus className="size-4" />
        New Project
      </Button>

      <nav className="flex flex-col gap-1 text-sm">
        {projects.map((project) => {
          const isActive = project.id === activeProjectId;
          return (
            <div key={project.id}>
              <div
                className={cn(
                  "group/project flex w-full items-center gap-2 rounded-md px-2 py-2 font-medium",
                  isActive ? "text-primary" : "text-foreground hover:bg-muted",
                )}
              >
                <Link href={`/editor/${project.id}`} className="flex flex-1 items-center gap-2 truncate">
                  <Video className="size-4 shrink-0" />
                  <span className="flex-1 truncate text-left">{project.title}</span>
                </Link>
                <button
                  type="button"
                  aria-label="Project settings"
                  onClick={() => openSettings(project)}
                  className="shrink-0 rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Settings className="size-4" />
                </button>
              </div>

              {isActive && (
                <div className="ml-3 mt-0.5 flex flex-col gap-1 border-l-2 border-primary pl-3">
                  {scenes.map((scene, index) => {
                    const selected = scene.id === selectedSceneId;
                    return (
                      <button
                        key={scene.id}
                        type="button"
                        onClick={() => selectScene(scene.id)}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2 py-2 text-left transition-colors",
                          selected
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground hover:bg-muted",
                        )}
                      >
                        <ImageIcon
                          className={cn(
                            "size-4",
                            selected ? "text-accent-foreground" : "text-muted-foreground",
                          )}
                        />
                        <span className="flex-1 truncate text-left">Scene #{index + 1}</span>
                        <SceneStatus status={scene.status} />
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => onAddScene?.()}
                    className="mt-1 flex items-center justify-center gap-1.5 rounded-md border border-dashed border-border px-2 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Plus className="size-3.5" />
                    Add Scene
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <ProjectSettingsModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalConfig.mode}
        project={modalConfig.project}
      />
    </aside>
  );
}
