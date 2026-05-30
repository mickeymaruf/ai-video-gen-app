"use client";

import { useState } from "react";

export default function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [prompt, setPrompt] = useState("");

  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/"),
    );
    setFiles(dropped);
  };

  const pollStatus = async (id: string) => {
    while (true) {
      const res = await fetch(`/api/generate-status?jobId=${id}`);
      const data = await res.json();

      setStatus(data.status);

      if (data.status === "done") {
        setResult(data);
        setLoading(false);
        break;
      }

      if (data.status === "failed") {
        setLoading(false);
        break;
      }

      await new Promise((r) => setTimeout(r, 2000));
    }
  };

  const generate = async () => {
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("prompt", prompt);
    files.forEach((f) => formData.append("images", f));

    const res = await fetch("/api/generate", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setJobId(data.jobId);

    pollStatus(data.jobId);
  };

  return (
    <div className="min-h-screen bg-black text-white flex justify-center p-6">
      <div className="w-full max-w-xl space-y-4">
        <h1 className="text-2xl font-bold">AI Product Video Generator</h1>

        {/* DROP ZONE */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="h-40 border border-dashed border-gray-600 flex items-center justify-center rounded"
        >
          Drag & drop product image
        </div>

        {/* PREVIEW */}
        {files.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {files.map((f, i) => (
              <img
                key={i}
                src={URL.createObjectURL(f)}
                className="h-24 w-full object-cover rounded"
              />
            ))}
          </div>
        )}

        {/* PROMPT */}
        <textarea
          className="w-full p-3 bg-gray-900 border border-gray-700 rounded"
          placeholder="Luxury skincare, cinematic slow motion, premium ad"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        {/* BUTTON */}
        <button
          onClick={generate}
          disabled={loading}
          className="w-full p-3 bg-white text-black font-semibold rounded"
        >
          {loading ? `Generating... (${status})` : "Generate"}
        </button>

        {/* RESULT */}
        {result && (
          <div className="space-y-4">
            <img src={result.image} className="rounded w-full" />
            <video src={result.video} controls className="rounded w-full" />
          </div>
        )}
      </div>
    </div>
  );
}
