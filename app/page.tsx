"use client";

import { type ChangeEvent, type DragEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Camera, Check, Flame } from "lucide-react";
import { useFridge } from "@/lib/fridge-context";

export default function UploadPage() {
  const router = useRouter();
  const { analyzeImage, loadDemoFridge, startBlankFridge } = useFridge();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const selectFile = (chosen?: File) => {
    if (chosen?.type.startsWith("image/")) {
      setFile(chosen);
      setPreview(URL.createObjectURL(chosen));
    }
  };

  // With a photo, run Gemini analysis; without one, fall back to the sample fridge.
  const turnIntoRecipe = () => {
    if (file) {
      void analyzeImage(file);
    } else {
      loadDemoFridge();
    }
    router.push("/analyzing");
  };

  const startDemo = () => {
    loadDemoFridge();
    router.push("/analyzing");
  };

  // No photo to analyse, so skip the vision step and go straight to a blank list.
  const startManual = () => {
    startBlankFridge();
    router.push("/verify");
  };

  return (
    <section className="mx-auto max-w-[760px] px-6 pt-16 pb-12 text-center max-[700px]:pt-[53px]">
      <p className="mb-3 text-[11px] font-bold tracking-[0.13em] text-leaf">
        YOUR KITCHEN, MADE EASIER
      </p>
      <h1 className="text-[clamp(42px,6vw,62px)] leading-[1.05] font-bold tracking-[-0.045em]">
        What&apos;s in your fridge
        <br />
        <em className="font-bold text-leaf not-italic">today?</em>
      </h1>
      <p className="mx-auto mt-4 mb-8 max-w-[465px] leading-[1.6] text-muted">
        Turn the ingredients you already have into something delicious. Less waste, more good food.
      </p>

      <div
        className={`relative flex min-h-[344px] flex-col items-center justify-center gap-2.5 overflow-hidden rounded-[19px] border-[1.5px] border-dashed border-ash-400 bg-ash-150 text-muted transition-all duration-200 hover:border-leaf hover:bg-[#f1f8f2] ${dragging ? "border-leaf bg-[#f1f8f2]" : ""}`}
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
          className="hidden"
          type="file"
          accept="image/*"
          onChange={(event: ChangeEvent<HTMLInputElement>) => selectFile(event.target.files?.[0])}
        />
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="h-[344px] w-full object-cover" src={preview} alt="Your fridge upload" />
            <span className="absolute bottom-[17px] left-[17px] flex items-center gap-2 rounded-[20px] bg-[#193c2dcc] px-3 py-2 text-xs text-white">
              <Check size={14} /> Photo ready — click to change
            </span>
          </>
        ) : (
          <>
            <div className="mb-2 grid place-items-center rounded-[17px] bg-[#e4f0e8] px-5 py-3 text-leaf">
              <Camera size={28} />
            </div>
            <strong className="text-[17px] text-ink">Drop your fridge photo here</strong>
            <span>or click to browse your device</span>
            <small className="mt-[7px] rounded-[20px] bg-ash-200 px-3 py-[7px] text-[11px]">
              JPG &nbsp; PNG &nbsp; HEIC · up to 20 MB
            </small>
          </>
        )}
      </div>

      <div className="my-[18px] flex items-center gap-[11px] text-xs text-ash-650">
        <span className="h-px flex-1 bg-line" />
        or try with a demo fridge
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="flex justify-center gap-3 max-[700px]:flex-col-reverse">
        <button
          className="inline-flex items-center gap-2 rounded-[10px] border border-line bg-white px-5 py-3 text-sm font-bold text-ink hover:bg-[#f1f6f1]"
          onClick={startDemo}
        >
          <Flame size={16} /> Use demo fridge
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-[10px] border border-transparent bg-leaf px-5 py-3 text-sm font-bold text-white shadow-[0_4px_10px_#27725c23] hover:bg-[#1d614d] disabled:cursor-not-allowed disabled:bg-ash-500 disabled:shadow-none disabled:hover:bg-ash-500"
          onClick={turnIntoRecipe}
        >
          Turn into recipe <ArrowRight size={16} />
        </button>
      </div>

      <div className="mt-[6px] flex justify-center">
        <button
          className="inline-flex items-center gap-2 border-0 bg-transparent px-0 py-[10px] text-sm text-[#597066] hover:text-leaf"
          onClick={startManual}
        >
          Or type in your ingredients instead <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
}
