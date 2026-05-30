import { Loader2 } from "lucide-react";

/** Full-screen spinner shown while the editor entry route loads. */
export default function EditorLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  );
}
