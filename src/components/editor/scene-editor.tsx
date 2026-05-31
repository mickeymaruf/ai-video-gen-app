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
import { createScene } from "@/server/projects/actions";
import { getVideoModel, VIDEO_MODELS } from "@/lib/video-models";
import type { GenerationLog, GenStatus } from "@/types/generation";
import {
  LANGUAGE_OPTIONS,
  TYPE_OPTIONS,
  type SceneData,
  type SceneVersionData,
} from "@/types/project";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

const TYPE_SELECT_OPTIONS: SelectOption[] = TYPE_OPTIONS.map((value) => ({
  value,
  label: value,
}));
const LANGUAGE_SELECT_OPTIONS: SelectOption[] = LANGUAGE_OPTIONS.map(
  (value) => ({
    value,
    label: value,
  }),
);
const MODEL_SELECT_OPTIONS: SelectOption[] = VIDEO_MODELS.map((model) => ({
  value: model.id,
  label: model.label,
}));

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
  onChange,
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}) {
  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? value;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none">
        <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
        <span className="text-sm font-medium text-foreground">
          {selectedLabel}
        </span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
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
function SoundToggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (on: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <FieldLabel>Sound</FieldLabel>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => onChange(!on)}
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
 * product image reference, and the primary Generate action. Resumes polling for
 * jobs still running after a refresh. Regenerating updates this same scene and
 * appends a new video version (no new card); the header's version switcher
 * toggles between previously generated videos, defaulting to the latest on load.
 *
 * A temporary scene (`isTemporary`) is a client-only card with no DB row yet; it
 * is persisted via `createScene` on the first Generate, after which `onPersisted`
 * lets the parent drop the temp card and reload the real, persisted scene.
 */
export function SceneEditor({
  projectId,
  scene,
  index,
  isTemporary = false,
  onPersisted,
  onSelectedVideoChange,
}: {
  projectId: string;
  scene: SceneData;
  index: number;
  isTemporary?: boolean;
  onPersisted?: () => void;
  onSelectedVideoChange?: (videoUrl: string | null) => void;
}) {
  const router = useRouter();
  const [productImages, setProductImages] = useState<File[]>([]);
  const [existingImage, setExistingImage] = useState<string | null>(
    scene.imageUrl,
  );
  const [startCard, setStartCard] = useState<File | null>(null);
  const [endCard, setEndCard] = useState<File | null>(null);
  const [existingStartImage, setExistingStartImage] = useState<string | null>(
    scene.startImageUrl,
  );
  const [existingEndImage, setExistingEndImage] = useState<string | null>(
    scene.endImageUrl,
  );
  const [type, setType] = useState(scene.type);
  const [language, setLanguage] = useState(scene.language);
  const [modelId, setModelId] = useState(scene.model);
  const [sound, setSound] = useState(scene.sound);
  const [script, setScript] = useState(scene.script);
  const [visualGuide, setVisualGuide] = useState(scene.visualGuide);

  const model = getVideoModel(modelId);
  const [status, setStatus] = useState<GenStatus>(scene.status);
  const [logs, setLogs] = useState<GenerationLog[]>([]);
  const [versions, setVersions] = useState<SceneVersionData[]>(scene.versions);
  // Default to the latest version on load; switching is purely client-side.
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    scene.versions.at(-1)?.id ?? null,
  );
  const [error, setError] = useState<string | null>(scene.error);
  const [notice, setNotice] = useState<string | null>(null);

  const selectedVideoUrl =
    versions.find((version) => version.id === selectedVersionId)?.videoUrl ??
    null;
  const versionOptions: SelectOption[] = versions
    .map((version, i) => ({
      value: version.id,
      label: String(i + 1),
    }))
    .reverse();

  const isGenerating =
    status === "SUBMITTING" ||
    status === "IN_QUEUE" ||
    status === "IN_PROGRESS";

  // Report the currently selected video up so the navbar Export can collect it.
  useEffect(() => {
    onSelectedVideoChange?.(selectedVideoUrl);
  }, [selectedVideoUrl, onSelectedVideoChange]);

  // Poll for live status/logs until the 9:16 video is ready. Transient errors
  // are NOT terminal: the webhook (and resume-on-mount) reconcile the real result,
  // so we leave the scene running and only surface a soft notice.
  async function runPoll(requestId: string, modelToPoll: string) {
    try {
      for (;;) {
        const result = await pollVideoGeneration(
          scene.id,
          requestId,
          modelToPoll,
        );
        setLogs(result.logs);
        setStatus(result.status);
        if (result.status === "COMPLETED") {
          if (result.videoUrl) {
            const version = {
              id: crypto.randomUUID(),
              videoUrl: result.videoUrl,
            };
            setVersions((prev) => [...prev, version]);
            setSelectedVersionId(version.id);
          }
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
      void runPoll(scene.requestId, scene.model);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGenerate() {
    const hasStartFrame =
      productImages.length > 0 ||
      existingImage ||
      startCard ||
      existingStartImage;
    if (!hasStartFrame) {
      setStatus("ERROR");
      setError("Add a product image or a start card before generating.");
      return;
    }

    setStatus("SUBMITTING");
    setError(null);
    setNotice(null);
    setLogs([]);

    try {
      const formData = new FormData();
      formData.set("script", script);
      formData.set("visualGuide", visualGuide);
      formData.set("type", type);
      formData.set("language", language);
      formData.set("model", modelId);
      formData.set("sound", String(sound));
      if (productImages[0]) formData.set("image", productImages[0]);
      else if (existingImage) formData.set("imageUrl", existingImage);
      if (startCard) formData.set("startCard", startCard);
      else if (existingStartImage)
        formData.set("startImageUrl", existingStartImage);
      if (model.endImageParam) {
        if (endCard) formData.set("endCard", endCard);
        else if (existingEndImage)
          formData.set("endImageUrl", existingEndImage);
      }

      // A temporary scene has no DB row yet — persist it before submitting so
      // the job has a scene to attach to (this is the only moment it persists).
      const targetId = isTemporary ? await createScene(projectId) : scene.id;
      const { requestId } = await submitVideoGeneration(targetId, formData);

      if (isTemporary) {
        // The temp card is now a real IN_QUEUE scene: drop it and reload so the
        // persisted scene mounts and resumes polling from its stored status.
        onPersisted?.();
        router.refresh();
        return;
      }

      await runPoll(requestId, modelId);
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
          value={type}
          options={TYPE_SELECT_OPTIONS}
          onChange={setType}
        />
        <MetaSelect
          label="Language"
          value={language}
          options={LANGUAGE_SELECT_OPTIONS}
          onChange={setLanguage}
        />
        <MetaSelect
          label="Model"
          value={modelId}
          options={MODEL_SELECT_OPTIONS}
          onChange={setModelId}
        />
        {versions.length > 0 && (
          <div className="ml-auto">
            <MetaSelect
              label="Version"
              value={selectedVersionId ?? ""}
              options={versionOptions}
              onChange={setSelectedVersionId}
            />
          </div>
        )}
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
              {model.audioParam && (
                <SoundToggle on={sound} onChange={setSound} />
              )}
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

          {/* Start Card + End Card (end frame only when the model supports it) */}
          <div className="flex w-3/4 gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <FieldLabel>Start Card</FieldLabel>
              <CardImageUploader
                image={startCard}
                onChange={setStartCard}
                label="Start Card"
                existingUrl={existingStartImage}
                onRemoveExisting={() => setExistingStartImage(null)}
              />
            </div>
            {model.endImageParam && (
              <div className="flex flex-1 flex-col gap-1.5">
                <FieldLabel>End Card</FieldLabel>
                <CardImageUploader
                  image={endCard}
                  onChange={setEndCard}
                  label="End Card"
                  existingUrl={existingEndImage}
                  onRemoveExisting={() => setExistingEndImage(null)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: 9:16 video preview + generation controls */}
        <div className="flex w-64 shrink-0 flex-col gap-3">
          <div className="relative flex aspect-portrait w-full overflow-hidden rounded-lg border border-border bg-muted">
            {isGenerating ? (
              <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="size-6 animate-spin text-primary" />
                <span className="text-xs text-center px-2">
                  {STATUS_LABEL[status]}
                </span>
              </div>
            ) : selectedVideoUrl ? (
              <video
                key={selectedVersionId}
                src={selectedVideoUrl}
                controls
                autoPlay
                loop
                className="size-full object-contain bg-foreground"
              />
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
            ) : versions.length > 0 ? (
              <RefreshCw className="size-4" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {isGenerating
              ? "Generating…"
              : versions.length > 0
                ? "Regenerate"
                : "Generate"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
