"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, Loader2, Plus, Settings, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProjectSettingsModal } from "@/components/editor/project-settings-modal";
import { createScene } from "@/server/projects/actions";
import type { ProjectSummary, SceneSummary } from "@/types/project";
import { cn } from "@/lib/utils";

interface EditorSidebarProps {
  projects: ProjectSummary[];
  scenes: SceneSummary[];
  activeProjectId?: string;
  activeSceneId?: string;
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
 * selectable scene tree. "New Project" opens the creation modal (name + aspect
 * ratio) and the per-project gear opens the same modal in settings mode. "Add
 * Scene" persists via a server action then navigates to the new scene.
 */
export function EditorSidebar({
  projects,
  scenes,
  activeProjectId,
  activeSceneId,
}: EditorSidebarProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
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

  const addScene = () => {
    if (!activeProjectId) return;
    startTransition(async () =>
      router.push(`/editor/${activeProjectId}?scene=${await createScene(activeProjectId)}`),
    );
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
                    const selected = scene.id === activeSceneId;
                    return (
                      <Link
                        key={scene.id}
                        href={`/editor/${project.id}?scene=${scene.id}`}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2 py-2 transition-colors",
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
                      </Link>
                    );
                  })}

                  <button
                    type="button"
                    onClick={addScene}
                    disabled={pending}
                    className="mt-1 flex items-center justify-center gap-1.5 rounded-md border border-dashed border-border px-2 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
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
