"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createProject, updateProject } from "@/server/projects/actions";
import {
  ASPECT_RATIOS,
  DEFAULT_ASPECT_RATIO,
  type AspectRatio,
  type ProjectSummary,
} from "@/types/project";
import { cn } from "@/lib/utils";

interface ProjectSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** "create" asks for a name then creates + navigates; "settings" edits an existing project. */
  mode: "create" | "settings";
  /** Required in "settings" mode — the project being edited. */
  project?: ProjectSummary;
}

/**
 * Project creation / settings modal.
 *
 * Reused for two flows: creating a new project (name + aspect ratio, then
 * navigate to its editor) and editing an existing one (rename + aspect ratio,
 * then save). Project cost is displayed as read-only (skipped in actions per spec 08).
 */
export function ProjectSettingsModal({
  open,
  onOpenChange,
  mode,
  project,
}: ProjectSettingsModalProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [aspectRatio, setAspectRatio] =
    useState<AspectRatio>(DEFAULT_ASPECT_RATIO);

  const isSettings = mode === "settings";

  // Sync the form to the active project (or empty defaults) each time it opens —
  // a legitimate external→form sync (the parent picks which project is edited).
  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTitle(isSettings ? (project?.title ?? "") : "");
    setAspectRatio(project?.aspectRatio ?? DEFAULT_ASPECT_RATIO);
  }, [open, isSettings, project?.title, project?.aspectRatio]);

  const submit = () => {
    startTransition(async () => {
      if (isSettings) {
        if (!project) return;
        await updateProject(project.id, { title, aspectRatio });
        router.refresh();
        onOpenChange(false);
        return;
      }
      const id = await createProject({ title, aspectRatio });
      onOpenChange(false);
      router.push(`/editor/${id}`);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-sm gap-0 overflow-hidden rounded-2xl p-0">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-base font-semibold text-foreground">
              {isSettings ? "Project Settings" : "New Project"}
            </h2>
            <button
              type="button"
              aria-label="Close"
              onClick={() => onOpenChange(false)}
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-col gap-5 px-6 py-5">
            {/* Project Name */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="project-name"
                className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase"
              >
                Project Name
              </label>
              <Input
                id="project-name"
                value={title}
                autoFocus
                placeholder="Untitled Project"
                className="h-10 bg-muted/60 text-sm"
                onChange={(event) => setTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") submit();
                }}
              />
            </div>

            {/* Aspect Ratio — horizontal segmented pill */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
                Aspect Ratio
              </span>
              <div className="flex rounded-lg border border-border overflow-hidden">
                {ASPECT_RATIOS.map((ratio, index) => {
                  const selected = ratio.value === aspectRatio;
                  return (
                    <button
                      key={ratio.value}
                      type="button"
                      onClick={() => setAspectRatio(ratio.value)}
                      className={cn(
                        "flex flex-1 items-center justify-center py-2.5 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                        index > 0 && "border-l border-border",
                        selected
                          ? "bg-primary text-primary-foreground"
                          : "bg-background text-foreground hover:bg-muted",
                      )}
                    >
                      {ratio.value}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Project Cost — read-only display */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
                Project Cost
              </span>
              <Input
                value="$1.54"
                readOnly
                disabled
                className="h-10 bg-muted/60 text-sm"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
            <Button
              variant="ghost"
              disabled={pending}
              onClick={() => onOpenChange(false)}
              className="text-sm font-semibold text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={submit}
              disabled={pending}
              className="min-w-16 text-sm font-semibold"
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              {isSettings ? "Save" : "Create Project"}
            </Button>
          </div>
      </DialogContent>
    </Dialog>
  );
}
