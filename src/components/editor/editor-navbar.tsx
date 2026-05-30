"use client";

import { ChevronDown, Triangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Top navigation bar for the editor shell.
 *
 * Spans the full screen width. The left cell matches the sidebar width to
 * form a unified vertical column and hosts the workspace/brand switcher.
 * The remaining section holds the project title, billing + connection
 * status, and the primary Export action.
 */
export function EditorNavbar() {
  return (
    <header className="flex h-16 shrink-0 items-center border-b bg-card">
      {/* Brand switcher cell — width-matched to the sidebar */}
      <div className="flex h-full w-64 shrink-0 items-center border-r px-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-11 w-full items-center gap-2 rounded-lg border border-border bg-card px-3 text-left transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none">
            <Triangle className="size-3 fill-foreground text-foreground" />
            <span className="flex-1 truncate text-sm font-semibold">
              Cohete Brand
            </span>
            <ChevronDown className="size-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-(--anchor-width)">
            <DropdownMenuItem>Cohete Brand</DropdownMenuItem>
            <DropdownMenuItem>Add another brand</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Workspace settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Project info + global actions */}
      <div className="flex flex-1 items-center gap-4 px-6">
        <h1 className="text-base font-bold text-foreground">Project #1</h1>
        <span className="text-sm text-muted-foreground">$1.59</span>

        {/* Connection status */}
        <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1">
          <span className="size-2 rounded-full bg-success" />
          <span className="text-sm font-medium text-foreground">
            fal.ai connected
          </span>
          <button
            type="button"
            className="text-xs font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:text-foreground"
          >
            Disconnect
          </button>
        </div>

        <Button
          size="lg"
          className="ml-auto h-9 rounded-lg px-5 font-semibold"
        >
          Export
        </Button>
      </div>
    </header>
  );
}
