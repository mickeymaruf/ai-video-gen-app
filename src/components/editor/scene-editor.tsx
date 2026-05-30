"use client";

import { useState } from "react";
import { ChevronDown, Loader2, Sparkles, Upload } from "lucide-react";

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
import {
  pollVideoGeneration,
  submitVideoGeneration,
} from "@/server/generation/actions";
import type { GenerationLog } from "@/types/generation";
import { cn } from "@/lib/utils";

const SCRIPT_TEXT =
  "A cinematic aerial shot panning over a neon-drenched futuristic city at midnight. Rain glistens on metallic surfaces.";

type GenStatus =
  | "idle"
  | "submitting"
  | "IN_QUEUE"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "error";

const STATUS_LABEL: Record<Exclude<GenStatus, "idle">, string> = {
  submitting: "Uploading & submitting…",
  IN_QUEUE: "Queued…",
  IN_PROGRESS: "Generating…",
  COMPLETED: "Generation complete",
  error: "Generation failed",
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

/** Small segmented control toggling the start / end reference card. */
function CardSideTabs({
  value,
  onChange,
}: {
  value: "start" | "end";
  onChange: (value: "start" | "end") => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted p-1">
      {(["start", "end"] as const).map((side) => (
        <button
          key={side}
          type="button"
          onClick={() => onChange(side)}
          className={cn(
            "rounded-md px-3 py-1 text-xs font-semibold tracking-wide uppercase transition-colors",
            value === side
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {side} Card
        </button>
      ))}
    </div>
  );
}

/** Section label shared by the SCRIPT / VISUAL GUIDE / PRODUCT IMAGES blocks. */
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
 * Mirrors the active-scene editor: script + visual guidance prompts, a
 * start/end reference card uploader, product image references, and the
 * primary Generate action. The blue ring marks the selected scene.
 */
export function SceneEditor() {
  const [cardSide, setCardSide] = useState<"start" | "end">("start");
  const [productImages, setProductImages] = useState<File[]>([]);
  const [script, setScript] = useState(SCRIPT_TEXT);
  const [visualGuide, setVisualGuide] = useState(SCRIPT_TEXT);
  const [status, setStatus] = useState<GenStatus>("idle");
  const [logs, setLogs] = useState<GenerationLog[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isGenerating =
    status === "submitting" ||
    status === "IN_QUEUE" ||
    status === "IN_PROGRESS";

  // Submit to the Fal.ai queue, then poll for live status/logs until the 9:16
  // video is ready — kept off the render thread so the UI never blocks.
  async function handleGenerate() {
    if (productImages.length === 0) {
      setStatus("error");
      setError("Add at least one product image before generating.");
      return;
    }

    setStatus("submitting");
    setError(null);
    setVideoUrl(null);
    setLogs([]);

    try {
      const formData = new FormData();
      formData.set("script", script);
      formData.set("visualGuide", visualGuide);
      formData.set("image", productImages[0]);

      const requestId = await submitVideoGeneration(formData);

      for (;;) {
        const result = await pollVideoGeneration(requestId);
        setLogs(result.logs);
        setStatus(result.status);
        if (result.status === "COMPLETED") {
          setVideoUrl(result.videoUrl);
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
      }
    } catch (cause) {
      setStatus("error");
      setError(cause instanceof Error ? cause.message : "Generation failed.");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Card className="gap-5 rounded-xl p-5 ring-2 ring-primary">
        {/* Header row: scene meta + reference-card tabs */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold tracking-wide text-foreground uppercase">
            Scene #1
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
            options={[
              "Google Veo 3",
              "Kling 1.6",
              "Luma Ray 2",
              "Runway Gen-3",
            ]}
          />
          <div className="ml-auto">
            <CardSideTabs value={cardSide} onChange={setCardSide} />
          </div>
        </div>

        {/* Body: prompts (left) + reference-card uploader (right) */}
        <div className="flex gap-5">
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
          </div>

          {/* Start / End reference card upload */}
          <button
            type="button"
            className="flex w-52 shrink-0 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-center transition-colors hover:bg-muted"
          >
            <Upload className="size-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              + Upload {cardSide === "start" ? "Start" : "End"} Card
            </span>
          </button>
        </div>

        {/* Footer: product images + generate */}
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <FieldLabel>Product Images</FieldLabel>
            <ProductImageUploader
              images={productImages}
              onChange={setProductImages}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="h-12 rounded-lg px-8 text-sm font-semibold"
          >
            {isGenerating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {isGenerating ? "Generating…" : "Generate"}
          </Button>
        </div>
      </Card>

      {/* Live generation feedback + 9:16 video preview below the editor card */}
      {status !== "idle" && (
        <Card className="gap-4 rounded-xl p-5">
          <div className="flex items-center gap-2">
            {isGenerating && (
              <Loader2 className="size-4 animate-spin text-primary" />
            )}
            <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              {STATUS_LABEL[status]}
            </span>
          </div>

          {logs.length > 0 && (
            <div className="max-h-40 overflow-y-auto rounded-lg border border-border bg-muted p-3 font-mono text-xs leading-relaxed text-muted-foreground">
              {logs.map((log, index) => (
                <p key={`${log.timestamp}-${index}`}>{log.message}</p>
              ))}
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          {videoUrl && (
            <video
              src={videoUrl}
              controls
              autoPlay
              loop
              className="aspect-portrait w-full max-w-xs rounded-lg border border-border bg-foreground object-contain"
            />
          )}
        </Card>
      )}
    </div>
  );
}
