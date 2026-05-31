import { Button } from "@/components/ui/button";

/**
 * Top bar for the editor's right column. Sits above the scrollable scene area
 * as a fixed-height, non-scrolling flex row, so it stays pinned while the
 * scenes scroll beneath it. Hosts the project title, billing + connection
 * status, and the primary Export action. (The brand/workspace switcher now
 * lives in the sidebar header, which spans the full screen height.)
 */
export function EditorNavbar({ title }: { title: string }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-card px-6">
      <h1 className="text-base font-bold text-foreground">{title}</h1>
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

      <Button size="lg" className="ml-auto h-9 rounded-lg px-5 font-semibold">
        Export
      </Button>
    </header>
  );
}
