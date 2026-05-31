"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, RefreshCw, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { ProductImageUploader } from "@/components/editor/product-image-uploader";
import { CardImageUploader } from "@/components/editor/card-image-uploader";
import {
  pollVideoGeneration,
  submitVideoGeneration,
} from "@/server/generation/actions";
import type { GenerationLog, GenStatus } from "@/types/generation";
import type { SceneData } from "@/types/project";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<Exclude<GenStatus, "IDLE">, string> = {
  SUBMITTING: "Uploading & submitting…",
  IN_QUEUE: "Queued…",
  IN_PROGRESS: "Generating…",
  COMPLETED: "Generation complete",
  ERROR: "Generation failed",
};

const POLL_INTERVAL = 1500;

/** Compact labelled dropdown used for the scene's TYPE / LANGUAGE / MODEL. */
function MetaSelect({
  label,
  value,
  options,
}: {
  label: string;
  value: string;
  options: string[];
}) {
  const [selected, setSelected] = useState(value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none">
        <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
        <span className="text-sm font-medium text-foreground">{selected}</span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {options.map((option) => (
          <DropdownMenuItem key={option} onClick={() => setSelected(option)}>
            {option}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Section label shared by the SCRIPT / VISUAL GUIDE / PRODUCT IMAGES / card blocks. */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
      {children}
    </span>
  );
}

/** Pill toggle for the per-scene sound option. */
function SoundToggle() {
  const [on, setOn] = useState(true);

  return (
    <div className="flex items-center gap-2">
      <FieldLabel>Sound</FieldLabel>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => setOn((value) => !value)}
        className={cn(
          "relative h-5 w-9 rounded-full transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          on ? "bg-primary" : "bg-border",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-4 rounded-full bg-card shadow-sm transition-all",
            on ? "left-4" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}

/**
 * Main scene configuration canvas.
 *
 * Controlled from the persisted `scene`: script + visual guidance prompts, the
 * product image reference, and the primary Generate action. Re-mounts per scene
 * (keyed by id), resumes polling for jobs still running after a refresh, and
 * forks a new scene when re-generating one that already produced a video.
 */
export function SceneEditor({
  projectId,
  scene,
  index,
}: {
  projectId: string;
  scene: SceneData;
  index: number;
}) {
  const router = useRouter();
  const [productImages, setProductImages] = useState<File[]>([]);
  const [existingImage, setExistingImage] = useState<string | null>(
    scene.imageUrl,
  );
  const [startCard, setStartCard] = useState<File | null>(null);
  const [endCard, setEndCard] = useState<File | null>(null);
  const [script, setScript] = useState(scene.script);
  const [visualGuide, setVisualGuide] = useState(scene.visualGuide);
  const [status, setStatus] = useState<GenStatus>(scene.status);
  const [logs, setLogs] = useState<GenerationLog[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(scene.videoUrl);
  const [error, setError] = useState<string | null>(scene.error);
  const [notice, setNotice] = useState<string | null>(null);

  const isGenerating =
    status === "SUBMITTING" ||
    status === "IN_QUEUE" ||
    status === "IN_PROGRESS";

  // Poll for live status/logs until the 9:16 video is ready. Transient errors
  // are NOT terminal: the webhook (and resume-on-mount) reconcile the real result,
  // so we leave the scene running and only surface a soft notice.
  async function runPoll(requestId: string) {
    try {
      for (;;) {
        const result = await pollVideoGeneration(scene.id, requestId);
        setLogs(result.logs);
        setStatus(result.status);
        if (result.status === "COMPLETED") {
          setVideoUrl(result.videoUrl);
          router.refresh();
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
      }
    } catch {
      setNotice(
        "Connection lost — generation continues in the background. Refresh to check.",
      );
    }
  }

  // Resume a job left running when the page was refreshed (status from the DB).
  const resumed = useRef(false);
  useEffect(() => {
    if (resumed.current) return;
    resumed.current = true;
    if (
      (status === "IN_QUEUE" || status === "IN_PROGRESS") &&
      scene.requestId
    ) {
      // setState fires only in runPoll's async callbacks (after await), not synchronously.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void runPoll(scene.requestId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGenerate() {
    if (productImages.length === 0 && !existingImage) {
      setStatus("ERROR");
      setError("Add at least one product image before generating.");
      return;
    }

    setStatus("SUBMITTING");
    setError(null);
    setNotice(null);
    setVideoUrl(null);
    setLogs([]);

    try {
      const formData = new FormData();
      formData.set("script", script);
      formData.set("visualGuide", visualGuide);
      if (productImages[0]) formData.set("image", productImages[0]);
      else if (existingImage) formData.set("imageUrl", existingImage);

      const { sceneId, requestId } = await submitVideoGeneration(
        scene.id,
        formData,
      );
      if (sceneId !== scene.id) {
        router.push(`/editor/${projectId}?scene=${sceneId}`);
        return;
      }
      await runPoll(requestId);
    } catch (cause) {
      setStatus("ERROR");
      setError(cause instanceof Error ? cause.message : "Generation failed.");
    }
  }

  return (
    <Card className="gap-5 rounded-xl p-5 ring-2 ring-primary">
      {/* Header row: scene label + meta dropdowns */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold tracking-wide text-foreground uppercase">
          Scene #{index + 1}
        </span>
        <MetaSelect
          label="Type"
          value="Cinematic"
          options={["Cinematic", "UGC", "Product", "Lifestyle"]}
        />
        <MetaSelect
          label="Language"
          value="Spanish (Argentina)"
          options={[
            "Spanish (Argentina)",
            "Spanish (Spain)",
            "English (US)",
            "Portuguese (Brazil)",
          ]}
        />
        <MetaSelect
          label="Model"
          value="Google Veo 3"
          options={["Google Veo 3", "Kling 1.6", "Luma Ray 2", "Runway Gen-3"]}
        />
      </div>

      {/* Body: left content column + right 9:16 video panel */}
      <div className="flex gap-5">
        {/* Left: script, visual guide, product images, start/end cards */}
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-col gap-2">
            <FieldLabel>Script</FieldLabel>
            <Textarea
              value={script}
              onChange={(event) => setScript(event.target.value)}
              className="min-h-20 resize-none bg-card"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <FieldLabel>Visual Guide</FieldLabel>
              <SoundToggle />
            </div>
            <Textarea
              value={visualGuide}
              onChange={(event) => setVisualGuide(event.target.value)}
              className="min-h-20 resize-none bg-card"
            />
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel>Product Images</FieldLabel>
            <div className="flex items-center gap-2">
              {existingImage && (
                <div className="group relative size-16 overflow-hidden rounded-lg bg-foreground">
                  {/* eslint-disable-next-line @next/next/no-img-element -- persisted fal.media URL, not a next/image asset */}
                  <img
                    src={existingImage}
                    alt="Product reference"
                    className="size-full object-cover"
                  />
                  <button
                    type="button"
                    aria-label="Remove image"
                    onClick={() => setExistingImage(null)}
                    className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="size-2.5" />
                  </button>
                </div>
              )}
              <ProductImageUploader
                images={productImages}
                onChange={setProductImages}
              />
            </div>
          </div>

          {/* Start Card + End Card side by side */}
          <div className="w-3/4 flex gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <FieldLabel>Start Card</FieldLabel>
              <CardImageUploader
                image={startCard}
                onChange={setStartCard}
                label="Start Card"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <FieldLabel>End Card</FieldLabel>
              <CardImageUploader
                image={endCard}
                onChange={setEndCard}
                label="End Card"
              />
            </div>
          </div>
        </div>

        {/* Right: 9:16 video preview + generation controls */}
        <div className="flex w-64 shrink-0 flex-col gap-3">
          <div className="relative flex aspect-portrait w-full overflow-hidden rounded-lg border border-border bg-muted">
            {videoUrl ? (
              <video
                src={videoUrl}
                controls
                autoPlay
                loop
                className="size-full object-contain bg-foreground"
              />
            ) : isGenerating ? (
              <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="size-6 animate-spin text-primary" />
                <span className="text-xs text-center px-2">
                  {STATUS_LABEL[status]}
                </span>
              </div>
            ) : null}
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
          {notice && <p className="text-xs text-muted-foreground">{notice}</p>}

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="h-10 w-full rounded-lg text-sm font-semibold"
          >
            {isGenerating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {isGenerating ? "Generating…" : "Generate"}
          </Button>

          {videoUrl && !isGenerating && (
            <Button
              onClick={handleGenerate}
              className="h-10 w-full rounded-lg text-sm font-semibold"
            >
              <RefreshCw className="size-4" />
              Regenerate
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
