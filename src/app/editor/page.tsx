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
    <div className="flex h-screen flex-col bg-background">
      <EditorNavbar title="New Project" />
      <div className="flex flex-1 overflow-hidden">
        <EditorSidebar projects={[]} scenes={[]} />
        <main className="flex flex-1 items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">
            Create your first project to get started.
          </p>
        </main>
      </div>
    </div>
  );
}
