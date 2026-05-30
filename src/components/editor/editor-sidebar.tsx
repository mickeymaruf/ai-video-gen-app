"use client";

import { useState } from "react";
import {
  Image as ImageIcon,
  Plus,
  Settings,
  Video,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Scene {
  id: string;
  label: string;
  duration: string;
}

const SCENES: Scene[] = [
  { id: "scene-1", label: "Scene #1", duration: "00:08" },
  { id: "scene-2", label: "Scene #2", duration: "00:08" },
  { id: "scene-3", label: "Scene #3", duration: "00:08" },
];

const SECONDARY_ITEMS = [
  { id: "ugc-1", label: "UGC #1_STATIC_BATC..." },
  { id: "project-3", label: "Project #3" },
];

/**
 * Left navigation sidebar for the editor shell.
 *
 * Hosts the primary "New Project" action, the active project with its
 * nested, selectable scene list, and secondary project/asset entries.
 */
export function EditorSidebar() {
  const [activeScene, setActiveScene] = useState<string>("scene-1");

  return (
    <aside className="flex w-64 shrink-0 flex-col gap-4 overflow-y-auto border-r bg-card p-4">
      <Button className="h-11 w-full rounded-lg text-sm font-semibold">
        <Plus className="size-4" />
        New Project
      </Button>

      <nav className="flex flex-col gap-1 text-sm">
        {/* Active project group */}
        <button
          type="button"
          className="group/project flex w-full items-center gap-2 rounded-md px-2 py-2 font-medium text-primary"
        >
          <Video className="size-4" />
          <span className="flex-1 truncate text-left">Project #1</span>
          <Settings className="size-4 text-muted-foreground transition-colors group-hover/project:text-foreground" />
        </button>

        {/* Nested scenes — blue tree line marks the active project */}
        <div className="ml-3 mt-0.5 flex flex-col gap-1 border-l-2 border-primary pl-3">
          {SCENES.map((scene) => {
            const isActive = scene.id === activeScene;
            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => setActiveScene(scene.id)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-2 transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-muted",
                )}
              >
                <ImageIcon
                  className={cn(
                    "size-4",
                    isActive ? "text-accent-foreground" : "text-muted-foreground",
                  )}
                />
                <span className="flex-1 truncate text-left">{scene.label}</span>
                <span className="text-xs text-muted-foreground">
                  {scene.duration}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            className="mt-1 flex items-center justify-center gap-1.5 rounded-md border border-dashed border-border px-2 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:bg-muted hover:text-foreground"
          >
            <Plus className="size-3.5" />
            Add Scene
          </button>
        </div>

        {/* Secondary projects / assets */}
        <div className="mt-1 flex flex-col gap-1">
          {SECONDARY_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="flex items-center gap-2 rounded-md px-2 py-2 text-foreground transition-colors hover:bg-muted"
            >
              <Video className="size-4 text-muted-foreground" />
              <span className="flex-1 truncate text-left">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </aside>
  );
}
