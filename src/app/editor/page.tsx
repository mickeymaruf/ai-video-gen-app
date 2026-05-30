import { EditorNavbar } from "@/components/editor/editor-navbar";
import { EditorSidebar } from "@/components/editor/editor-sidebar";
import { SceneEditor } from "@/components/editor/scene-editor";

/**
 * Editor shell: top navbar, left project sidebar, and the main scene
 * configuration canvas over a light workspace background.
 */
export default function EditorPage() {
  return (
    <div className="flex h-screen flex-col bg-background">
      <EditorNavbar />
      <div className="flex flex-1 overflow-hidden">
        <EditorSidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <SceneEditor />
        </main>
      </div>
    </div>
  );
}
