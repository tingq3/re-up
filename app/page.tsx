"use client";

import { type ChangeEvent, type DragEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const selectFile = (file?: File) => {
    if (file?.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const startAnalysis = () => router.push("/analyzing");

  return (
    <section className="upload-page">
      <p className="eyebrow">YOUR KITCHEN, MADE EASIER</p>
      <h1>
        What&apos;s in your fridge
        <br />
        <em>today?</em>
      </h1>
      <p className="intro">
        Turn the ingredients you already have into something delicious. Less waste, more good food.
      </p>

      <div
        className={`dropzone ${dragging ? "dragging" : ""} ${preview ? "has-preview" : ""}`}
        onClick={() => fileInput.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event: DragEvent) => {
          event.preventDefault();
          setDragging(false);
          selectFile(event.dataTransfer.files[0]);
        }}
      >
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          onChange={(event: ChangeEvent<HTMLInputElement>) => selectFile(event.target.files?.[0])}
        />
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Your fridge upload" />
            <span className="ready">✓ Photo ready — click to change</span>
          </>
        ) : (
          <>
            <div className="camera">⌑</div>
            <strong>Drop your fridge photo here</strong>
            <span>or click to browse your device</span>
            <small>JPG &nbsp; PNG &nbsp; HEIC · up to 20 MB</small>
          </>
        )}
      </div>

      <div className="or">
        <span />
        or try with a demo fridge
        <span />
      </div>

      <div className="upload-actions">
        <button className="secondary" onClick={startAnalysis}>
          ♨ Use demo fridge
        </button>
        <button className="primary" onClick={startAnalysis}>
          Turn into recipe <b>→</b>
        </button>
      </div>
    </section>
  );
}
