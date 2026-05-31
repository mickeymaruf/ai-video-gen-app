import { redirect } from "next/navigation";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { EditorSidebar } from "@/components/editor/editor-sidebar";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Editor entry: open the latest project, or prompt to create the first one. */
export default async function EditorPage() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true },
  });

  if (projects.length > 0) redirect(`/editor/${projects[0].id}`);

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-background">
      <EditorSidebar projects={[]} scenes={[]} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <EditorNavbar title="New Project" />
        <main className="flex min-h-0 flex-1 items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">
            Create your first project to get started.
          </p>
        </main>
      </div>
    </div>
  );
}
