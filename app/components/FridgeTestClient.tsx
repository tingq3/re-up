"use client";

import { useState } from "react";

export default function FridgeTestClient() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const handleTest = async () => {
    if (!file) {
      setResult("Please choose an image first.");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const base64 = await fileToBase64(file);

      const response = await fetch("/api/detect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: file.type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Request failed");
      }

      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="block w-full text-sm"
      />

      <button
        onClick={handleTest}
        disabled={!file || loading}
        className="rounded-lg bg-black px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Scanning..." : "Run Fridge Test"}
      </button>

      {result ? (
        <pre className="overflow-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
          {result}
        </pre>
      ) : null}
    </div>
  );
}

async function fileToBase64(file: File) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}