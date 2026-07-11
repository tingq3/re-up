"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFridge } from "@/lib/fridge-context";

// "AI vision at work" screen shown while the fridge photo is analysed by Gemini
// (see lib/vision.ts). Forwards to the ingredient check once analysis settles; the
// demo path (no analysis in flight) simply forwards after the minimum display time.
export default function AnalyzingPage() {
  const router = useRouter();
  const { analyzing } = useFridge();

  useEffect(() => {
    if (analyzing) return;
    // Small min-display so a fast/instant result doesn't flash the spinner.
    const timer = window.setTimeout(() => router.replace("/verify"), 400);
    return () => window.clearTimeout(timer);
  }, [analyzing, router]);

  return (
    <section className="analyzing">
      <div className="pulse">✦</div>
      <p className="eyebrow">AI VISION AT WORK</p>
      <h1>Looking inside your fridge…</h1>
      <p>Identifying ingredients, quantities, and the things that need using soon.</p>
      <div className="progress">
        <i />
      </div>
    </section>
  );
}
